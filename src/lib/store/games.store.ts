import * as Persistent from "@/store/persistent";
import * as Types from "@/types";
import { writable } from "svelte/store";

function createGamesStore() {
 const store = writable<Types.Game[]>([]);

 Persistent.games.get().then(games => {
  if (games) store.set(games.map(game => ({ ...game, running: false })));
  store.subscribe(async games => {
   await Persistent.games.set(games);
  });
 });

 const addGame = (
  game: Omit<
   Types.Game,
   | "createdAt"
   | "playtimeInSeconds"
   | "lastPlayedAt"
   | "running"
   | "executablePath"
  >,
 ) =>
  store.update(state => {
   state.push({
    ...game,
    createdAt: Date.now(),
    playtimeInSeconds: 0,
    lastPlayedAt: 0,
    running: false,
   });

   return state;
  });

 const removeGame = (remoteId: string) =>
  store.update(state => {
   state.splice(
    state.findIndex(game => game.remoteId == remoteId),
    1,
   );

   return state;
  });

 const updateGame = <T extends keyof Types.Game>(
  [key, value]: [T, Types.Game[T]],
  callback: (game: Types.Game) => Types.Game,
 ) =>
  store.update(state => {
   const index = state.findIndex(game => game[key] == value);
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

export const gamesStore = createGamesStore();
