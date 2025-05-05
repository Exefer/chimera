import {
  db,
  downloadSourcesTable,
  packsTable,
  type DownloadSourceEntry,
  type PackEntry,
} from "@/database";
import { downloadSourceSchema } from "@/schemas";
import type { SourceDownload, SteamGamesByLetter } from "@/types";
import { formatTitle } from "@/utils";
import { z } from "zod";

export const addNewDownloads = async (
  downloadSource: { id: number; name: string },
  downloads: z.infer<typeof downloadSourceSchema>["downloads"],
  steamGamesByLetter: SteamGamesByLetter
) => {
  const now = new Date();
  const objectIdsOnSource = new Set<string>();
  const result: Omit<PackEntry, "id">[] = [];

  for (const download of downloads) {
    const formattedTitle = formatTitle(download.title);
    const [firstLetter] = formattedTitle;
    const gamesInSteam = (steamGamesByLetter[firstLetter] || []).filter(app =>
      formattedTitle.startsWith(app.name)
    );
    if (gamesInSteam.length === 0) continue;
    gamesInSteam.forEach(game => objectIdsOnSource.add(game.id));
    result.push({
      ...download,
      packer: downloadSource.name,
      objectIds: gamesInSteam.map(app => app.id),
      downloadSourceId: downloadSource.id,
      createdAt: now,
      updatedAt: now,
    });
  }

  await packsTable.bulkAdd(result);
  await downloadSourcesTable.update(downloadSource.id, {
    objectIds: Array.from(objectIdsOnSource),
  });
};

export const importDownloadSource = async (
  downloadSource: Omit<DownloadSourceEntry, "id">,
  downloads: SourceDownload[],
  steamGamesByLetter: SteamGamesByLetter
) => {
  await db.transaction("rw", packsTable, downloadSourcesTable, async () => {
    const id = await downloadSourcesTable.add(downloadSource!);
    await addNewDownloads({ ...downloadSource, id }, downloads, steamGamesByLetter);
  });
};

export const deleteDownloadSource = async (id: number) => {
  await db.transaction("rw", packsTable, downloadSourcesTable, async () => {
    await packsTable.where({ downloadSourceId: id }).delete();
    await downloadSourcesTable.where({ id }).delete();
  });
};

export const deleteAllDownloadSources = async () => {
  await db.transaction("rw", packsTable, downloadSourcesTable, async () => {
    await packsTable.clear();
    await downloadSourcesTable.clear();
  });
};
