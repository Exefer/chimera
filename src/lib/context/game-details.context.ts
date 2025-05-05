import type { DownloadEntry, PackEntry } from "@/database";
import type { Game } from "@/types";
import type { SteamAppDetails } from "@/types/steam.types";
import { getContext, setContext } from "svelte";

interface GameDetailsContext {
  title: string;
  objectId: string;
  game: Game | undefined;
  packs: PackEntry[];
  download: DownloadEntry | undefined;
  details: SteamAppDetails | null;
  showDownloadOptionsModal: boolean;
  showGameOptionsModal: boolean;
  hasNSFWContentBlocked: boolean;
}

export const GameDetailsContext = Symbol("GameDetailsContext");

export const setGameDetailsContext = (context: GameDetailsContext) => {
  setContext(GameDetailsContext, context);
};

export const getGameDetailsContext = (): GameDetailsContext => {
  return getContext(GameDetailsContext);
};
