import * as Types from "@/types";
import * as Steam from "@/types/steam.types";
import { getContext, setContext } from "svelte";

export const GameContext = Symbol("GameContext");

interface GameContext {
  title: string;
  remoteId: string;
  local: Types.Game | undefined;
  packs: Types.Pack[];
  download: Types.Download | undefined;
  details: Steam.AppDetails | null;
  showDownloadOptionsModal: boolean;
  showGameOptionsModal: boolean;
  hasNSFWContentBlocked: boolean;
}

export const setGameContext = (context: GameContext) => {
  setContext(GameContext, context);
};

export const getGameContext = (): GameContext => {
  return getContext(GameContext);
};
