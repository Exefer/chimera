import * as Types from "@/types";
import * as Steam from "@/types/steam.types";
import { getContext, setContext } from "svelte";

export const GameDetailsContext = Symbol("GameDetailsContext");

interface GameDetailsContext {
  title: string;
  remoteId: string;
  game: Types.Game | undefined;
  packs: Types.Pack[];
  appDetails: Steam.AppDetails | null;
  showDownloadOptionsModal: boolean;
  showGameOptionsModal: boolean;
  hasNSFWContentBlocked: boolean;
}

export const setGameDetailsContext = (context: GameDetailsContext) => {
  setContext(GameDetailsContext, context);
};

export const getGameDetailsContext = (): GameDetailsContext => {
  return getContext(GameDetailsContext);
};
