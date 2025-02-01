import * as Steam from "@/types/steam.types";
import { fetch } from "@tauri-apps/plugin-http";
import ky from "ky";

// TODO: Localize
export const getSteamAppDetails = async (remoteId: string) => {
  const searchParams = new URLSearchParams({
    appids: remoteId,
    // l: language
  });

  return ky<Steam.AppDetailsResponse>(
    `https://store.steampowered.com/api/appdetails?${searchParams.toString()}`,
    { fetch }
  )
    .json()
    .then(response => {
      if (response[remoteId].success) return response[remoteId].data;
      return null;
    })
    .catch();
};

export const steamImageBuilder = {
  library: (remoteId: string) =>
    `https://steamcdn-a.akamaihd.net/steam/apps/${remoteId}/header.jpg`,
  libraryHero: (remoteId: string) =>
    `https://steamcdn-a.akamaihd.net/steam/apps/${remoteId}/library_hero.jpg`,
  logo: (remoteId: string) =>
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${remoteId}/logo.png`,
  cover: (remoteId: string) =>
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${remoteId}/library_600x900.jpg`,
  icon: (remoteId: string, clientIcon: string) =>
    `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${remoteId}/${clientIcon}.ico`,
};
