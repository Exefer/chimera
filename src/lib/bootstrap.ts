import { STEAM_GAMES_URL } from "@/constants";
import { steamGames, steamGamesByLetter } from "@/stores";
import type { SteamGamesByLetter } from "@/types";
import type { SteamGame } from "@/types/steam.types";
import { formatTitle } from "@/utils";
import ky from "ky";

export const initSteamGamesStores = () => {
  ky<SteamGame[]>(STEAM_GAMES_URL)
    .then(response => response.json())
    .then(data =>
      data.map(app => ({
        name: app.name,
        id: String(app.id),
        clientIcon: app.clientIcon,
      }))
    )
    .then(data => {
      steamGames.set(data);
      steamGamesByLetter.set(
        data.reduce<SteamGamesByLetter>((acc, app) => {
          if (!app.name) return acc;
          const formattedTitle = formatTitle(app.name);
          const [firstLetter] = formattedTitle;

          if (!acc[firstLetter]) acc[firstLetter] = [];

          acc[firstLetter].push({ name: formattedTitle, id: app.id });
          return acc;
        }, {})
      );
    });
};
