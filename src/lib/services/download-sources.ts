import { DownloadSourceStatus } from "@/constants";
import { db, downloadSourcesTable, packsTable } from "@/database";
import { downloadSourceSchema } from "@/schemas";
import { steamGamesByLetter } from "@/stores";
import { downloadSourcesWorker } from "@/workers";
import { get } from "svelte/store";
import ky, { HTTPError } from "ky";
import { z } from "zod";

export const importDownloadSource = async (url: string) => {
  const now = new Date();
  const response = await ky<z.infer<typeof downloadSourceSchema>>(url);
  const data = await response.json();

  await downloadSourcesWorker.importDownloadSource(
    {
      url,
      name: data.name,
      etag: response.headers.get("etag")!,
      status: DownloadSourceStatus.UpToDate,
      downloadCount: data.downloads.length,
      createdAt: now,
      updatedAt: now,
      objectIds: [],
    },
    data.downloads,
    get(steamGamesByLetter)
  );

  const channel = new BroadcastChannel("download_sources:sync");
  channel.postMessage(true);
  channel.close();
};

export const deleteDownloadSource = async (id: number) => {
  await downloadSourcesWorker.deleteDownloadSource(id);

  const channel = new BroadcastChannel("download_sources:sync");
  channel.postMessage(true);
  channel.close();
};

export const deleteAllDownloadSources = async () => {
  await downloadSourcesWorker.deleteAllDownloadSources();

  const channel = new BroadcastChannel("download_sources:sync");
  channel.postMessage(true);
  channel.close();
};

export const validateDownloadSource = async (url: string) => {
  const response = await ky(url);
  const data = await response.json();
  const parsed = downloadSourceSchema.parse(data);

  return {
    name: parsed.name,
    etag: response.headers.get("etag")!,
    downloadCount: parsed.downloads.length,
  };
};

export const syncDownloadSources = async () => {
  let newPacksCount = 0;

  try {
    const downloadSources = await downloadSourcesTable.toArray();
    const existingPacks = await packsTable.toArray();

    for (const downloadSource of downloadSources) {
      const headers = new Headers();
      if (downloadSource.etag) {
        headers.set("If-None-Match", downloadSource.etag);
      }

      try {
        const response = await ky(downloadSource.url, { headers });
        const data = await response.json();
        const parsed = downloadSourceSchema.parse(data);

        await db.transaction("rw", packsTable, downloadSourcesTable, async () => {
          await downloadSourcesTable.update(downloadSource.id, {
            etag: response.headers.get("etag")!,
            downloadCount: parsed.downloads.length,
            status: DownloadSourceStatus.UpToDate,
          });

          const newPacks = parsed.downloads.filter(
            download => !existingPacks.some(pack => pack.title === download.title)
          );

          await downloadSourcesWorker.addNewDownloads(
            downloadSource,
            newPacks,
            get(steamGamesByLetter)
          );
          newPacksCount += newPacks.length;
        });
      } catch (e) {
        const isNotModified = (e as HTTPError).response?.status === 304;
        await downloadSourcesTable.update(downloadSource.id, {
          status: isNotModified
            ? DownloadSourceStatus.UpToDate
            : DownloadSourceStatus.Errored,
        });
      }
    }

    const channel = new BroadcastChannel("download_sources:sync");
    channel.postMessage(newPacksCount);
    channel.close();
    return newPacksCount;
  } catch {
    return -1;
  }
};
