import type { AppLocale, DownloadSourceStatus } from "@/constants";
import type { Download, DownloadSource, Game, SourceDownload } from "@/types";
import type { SteamAppDetails } from "@/types/steam.types";
import Dexie, { type EntityTable } from "dexie";

interface GameDetailsEntry {
  objectId: string;
  locale: AppLocale;
  data: SteamAppDetails;
}

export interface PackEntry extends SourceDownload {
  id: number;
  packer: string;
  downloadSourceId: number;
  objectIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DownloadSourceEntry extends Omit<DownloadSource, "downloads"> {
  id: number;
  url: string;
  etag: string;
  status: DownloadSourceStatus;
  downloadCount: number;
  objectIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DownloadEntry extends Download {
  id: number;
}

export interface LibraryGame extends Game {
  id: number;
}

export const db = new Dexie("chimera") as Dexie & {
  gameDetails: EntityTable<GameDetailsEntry, "objectId">;
  packs: EntityTable<PackEntry, "id">;
  downloadSources: EntityTable<DownloadSourceEntry, "id">;
  downloads: EntityTable<DownloadEntry, "id">;
  library: EntityTable<LibraryGame, "id">;
};

db.version(1).stores({
  gameDetails: `objectId, locale, data`,
  packs: `++id, title, packer, fileSize, uris, uploadDate, downloadSourceId, objectIds, createdAt, updatedAt`,
  downloadSources: `++id, name, url, etag, status, objectIds, downloadCount, createdAt, updatedAt`,
  downloads: `++id, title, originalUrl, url, objectId, downloadPath, downloader, status, queued, extracting, automaticallyExtract, progress, downloadedBytes, fileSize, downloadSpeed, eta`,
  library: `++id, title, objectId, executablePath, launchOptions, iconUrl, playtimeInSeconds, lastPlayedAt, size, running, favorite`,
});

export const {
  gameDetails: gameDetailsTable,
  packs: packsTable,
  downloadSources: downloadSourcesTable,
  downloads: downloadsTable,
  library: libraryTable,
} = db;
