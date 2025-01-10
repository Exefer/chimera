import * as Steam from "@/types/steam.types";
import { fetch } from "@tauri-apps/plugin-http";

export const getSteamAppDetails = async (
 id: string | number,
): Promise<Steam.AppDetails> => {
 return fetch(`https://store.steampowered.com/api/appdetails?appids=${id}`)
  .then(response => response.json())
  .then(data => data[id].data);
};
