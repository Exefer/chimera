import { APP_LANGUAGES } from "@/constants";
import { gameDetailsTable } from "@/database";
import { settings } from "@/stores";
import type { SteamAppDetailsResponse } from "@/types/steam.types";
import { fetch } from "@tauri-apps/plugin-http";
import { t } from "svelte-i18n";
import { toast } from "svelte-sonner";
import { get } from "svelte/store";
import ky from "ky";

export const getSteamAppDetails = async (objectId: string) => {
  const cached = await gameDetailsTable.get(objectId);
  const currentLocale = get(settings).locale;

  if (cached && cached.locale === currentLocale) {
    return cached.data;
  }

  const searchParams = new URLSearchParams({
    appids: objectId,
    l: APP_LANGUAGES[currentLocale].name.toLowerCase(),
  });

  const data = await ky<SteamAppDetailsResponse>(
    `https://store.steampowered.com/api/appdetails?${searchParams.toString()}`,
    { fetch }
  )
    .json()
    .then(response => {
      if (response[objectId].success) return response[objectId].data;
      return null;
    })
    .catch(() => null);

  if (!data) {
    toast.error(get(t)("common.an_error_occurred"));
    return cached?.data || null;
  }

  if (cached) {
    await gameDetailsTable.update(objectId, { locale: currentLocale, data });
  } else {
    await gameDetailsTable.add({
      locale: currentLocale,
      objectId,
      data,
    });
  }

  return data;
};

export const steamImageBuilder = {
  library: (objectId: string) =>
    `https://steamcdn-a.akamaihd.net/steam/apps/${objectId}/header.jpg`,
  libraryHero: (objectId: string) =>
    `https://steamcdn-a.akamaihd.net/steam/apps/${objectId}/library_hero.jpg`,
  logo: (objectId: string) =>
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${objectId}/logo.png`,
  cover: (objectId: string) =>
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${objectId}/library_600x900.jpg`,
  icon: (objectId: string, clientIcon: string) =>
    `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${objectId}/${clientIcon}.ico`,
};
