import { db, downloadSourcesTable, packsTable, type PackEntry } from "@/database";
import { appsByLetter } from "@/stores";
import * as Types from "@/types";
import { formatTitle } from "@/utils";
import { get } from "svelte/store";

const addNewDownloads = async (
  downloadSource: { id: number; name: string },
  downloads: Types.SourceDownload[]
) => {
  const now = new Date();

  const remoteIdsOnSource = new Set<string>();
  const result: Array<Omit<PackEntry, "id">> = [];

  for (const download of downloads) {
    const formattedTitle = formatTitle(download.title);
    const [firstLetter] = formattedTitle;
    const gamesInSteam = (get(appsByLetter)[firstLetter] || []).filter(app =>
      formattedTitle.startsWith(app.name)
    );

    if (gamesInSteam.length === 0) continue;

    gamesInSteam.forEach(game => remoteIdsOnSource.add(game.id));

    result.push({
      ...download,
      packer: downloadSource.name,
      remoteIds: gamesInSteam.map(app => app.id),
      downloadSourceId: downloadSource.id,
      createdAt: now,
      updatedAt: now,
    });
  }

  await packsTable.bulkAdd(result);
  await downloadSourcesTable.update(downloadSource.id, {
    remoteIds: Array.from(remoteIdsOnSource),
  });
};

export const importDownloadSource = async (source: Types.Source, etag: string) => {
  await db.transaction("rw", packsTable, downloadSourcesTable, async () => {
    const now = new Date();

    const id = await downloadSourcesTable.add({
      name: source.name,
      url: source.url,
      etag,
      downloadCount: source.downloads.length,
      createdAt: now,
      updatedAt: now,
      remoteIds: [],
    });

    const downloadSource = await downloadSourcesTable.get(id);
    await addNewDownloads(downloadSource!, source.downloads);
  });
};

export const deleteDownloadSource = async (id: number) => {
  await db.transaction("rw", packsTable, downloadSourcesTable, async () => {
    await packsTable.where({ downloadSourceId: id }).delete();
    await downloadSourcesTable.where({ id }).delete();
  });
};

export const syncDownloadSources = async (id: number) => {};
