import { gameDetailsCache } from "@/database";
import { settings } from "@/stores";
import { t } from "svelte-i18n";
import { toast } from "svelte-sonner";
import { get } from "svelte/store";
import { getSteamAppDetails } from "./steam";

export const getGameDetails = async (remoteId: string) => {
  const cached = await gameDetailsCache.get(remoteId);
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
    await gameDetailsCache.update(remoteId, { locale: currentLocale, data });
  } else {
    await gameDetailsCache.add({
      locale: currentLocale,
      remoteId,
      data,
    });
  }

  return data;
};
