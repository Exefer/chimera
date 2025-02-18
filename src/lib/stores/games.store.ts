import * as Types from "@/types";
import { writable } from "svelte/store";
import * as Persistent from "./persistent";

function createGamesStore() {
  const store = writable<Types.Game[]>([]);

  Persistent.games.get().then(games => {
    if (games) store.set(games.map(game => ({ ...game, running: false })));
    store.subscribe(async games => {
      await Persistent.games.set(games);
    });
  });

  /**
   * Adds a game to the store.
   */
  const addGame = (game: Pick<Types.Game, "title" | "remote_id" | "icon_url">) =>
    store.update(state => {
      state.push({
        ...game,
        created_at: Date.now(),
        playtime_in_seconds: 0,
        executable_path: null,
        last_played_at: null,
        launch_options: null,
        size: null,
        running: false,
        favorite: false,
      });

      return state;
    });

  /**
   * Removes a game from the store.
   */
  const removeGame = (remoteId: string) =>
    store.update(state => {
      state.splice(
        state.findIndex(game => game.remote_id === remoteId),
        1
      );

      return state;
    });

  /**
   * Searches for a game by a property and value and updates it.
   */
  const updateGame = <T extends keyof Types.Game>(
    key: T,
    value: Types.Game[T],
    callback: (game: Types.Game) => Types.Game
  ) =>
    store.update(state => {
      const index = state.findIndex(game => game[key] === value);
      state[index] = callback(state[index]);

      return state;
    });

  return {
    ...store,
    addGame,
    removeGame,
    updateGame,
  };
}

export const games = createGamesStore();
