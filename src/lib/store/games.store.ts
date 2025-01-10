import * as Persistent from "@/store/persistent";
import * as Types from "@/types";
import { writable } from "svelte/store";

function createGamesStore() {
 const store = writable<Types.Game[]>([]);

 Persistent.games.get().then(games => {
  if (games) store.set(games);
  store.subscribe(async games => await Persistent.games.set(games));
 });

 const addGame = (
  game: Omit<
   Types.Game,
   "createdAt" | "updatedAt" | "playtimeInSeconds" | "lastPlayedAt"
  >,
 ) =>
  store.update(state => {
   const timestamp = Date.now();

   state.push(
    Object.assign(
     {
      createdAt: timestamp,
      updatedAt: timestamp,
      playtimeInSeconds: 0,
      lastPlayedAt: 0,
     } as Partial<Types.Game>,
     game,
    ),
   );

   return state;
  });

 const removeGame = (remoteId: number) =>
  store.update(state => {
   state.splice(
    state.findIndex(game => game.remoteId == remoteId),
    1,
   );

   return state;
  });

 const updateGame = (remoteId: number, newGame: Partial<Types.Game>) =>
  store.update(state => {
   const index = state.findIndex(game => game.remoteId == remoteId);
   state.splice(index, 1, { ...state[index], ...newGame });

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
