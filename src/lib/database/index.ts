import * as Types from "@/types";
import * as Steam from "@/types/steam.types";
import Dexie, { type EntityTable } from "dexie";

interface GameDetailsCacheEntry {
  remoteId: string;
  locale: Types.AppLocale;
  data: Steam.AppDetails;
}

export interface PackEntry extends Types.SourceDownload {
  id: number;
  packer: string;
  downloadSourceId: number;
  remoteIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DownloadSourceEntry extends Omit<Types.Source, "downloads"> {
  id: number;
  etag: string;
  downloadCount: number;
  remoteIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const db = new Dexie("chimera") as Dexie & {
  gameDetailsCache: EntityTable<GameDetailsCacheEntry, "remoteId">;
  packs: EntityTable<PackEntry, "id">;
  downloadSources: EntityTable<DownloadSourceEntry, "id">;
};

db.version(1).stores({
  gameDetailsCache: `remoteId, locale, data`,
  packs: `++id, title, fileSize, uris, uploadDate, downloadSourceId, packer, remoteIds, createdAt, updatedAt`,
  downloadSources: `++id, name, url, etag, remoteIds, downloadCount, createdAt, updatedAt`,
});

export const {
  gameDetailsCache,
  packs: packsTable,
  downloadSources: downloadSourcesTable,
} = db;
