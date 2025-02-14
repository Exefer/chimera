import * as Types from "@/types";
import * as Steam from "@/types/steam.types";
import Dexie, { type EntityTable } from "dexie";

interface GameDetailsCacheEntry {
  remoteId: string;
  locale: Types.AppLocale;
  data: Steam.AppDetails;
}

export const db = new Dexie("chimera") as Dexie & {
  gameDetailsCache: EntityTable<GameDetailsCacheEntry, "remoteId">;
};

db.version(1).stores({
  gameDetailsCache: "remoteId, locale, data",
});
