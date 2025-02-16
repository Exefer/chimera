import { db } from "@/database";
import { settings } from "@/stores";
import { t } from "svelte-i18n";
import { toast } from "svelte-sonner";
import { get } from "svelte/store";
import { getSteamAppDetails } from "./steam";

export const getGameDetails = async (remoteId: string) => {
  const cached = await db.gameDetailsCache.where("remoteId").equals(remoteId).first();
  const currentLocale = get(settings).general.locale;

  if (cached && cached.locale === currentLocale) {
    return cached.data;
  }

  const data = await getSteamAppDetails(remoteId, currentLocale);

  if (!data) {
    toast.error(get(t)("common.an_error_occurred"));
    // Fallback to cached data even if outdated
    return cached?.data || null;
  }

  if (cached) {
    await db.gameDetailsCache
      .where("remoteId")
      .equals(remoteId)
      .modify(entry => {
        entry.locale = currentLocale;
        entry.data = data;
      });
  } else {
    await db.gameDetailsCache.add({
      locale: currentLocale,
      remoteId,
      data,
    });
  }

  return data;
};
