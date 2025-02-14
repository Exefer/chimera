import * as Types from "@/types";
import * as Steam from "@/types/steam.types";
import Dexie, { type EntityTable } from "dexie";

export const db = new Dexie("chimera") as Dexie;

db.version(1).stores({
  gameDetails: "++id, remoteId, locale, data",
});

export const gameDetailsCache = db.table<{
  remoteId: string;
  locale: string;
  data: Steam.AppDetails;
}>("gameDetails");
