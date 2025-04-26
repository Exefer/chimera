import type { PackEntry } from "@/database";
import * as Types from "@/types";
import * as Steam from "@/types/steam.types";
import { getContext, setContext } from "svelte";
import type { Observable } from "dexie";

export const GameContext = Symbol("GameContext");

interface GameContext {
  title: string;
  remoteId: string;
  game: Types.Game | undefined;
  packs: Observable<PackEntry[]>;
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
