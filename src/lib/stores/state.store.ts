import type { SteamGamesByLetter } from "@/types";
import type { SteamGame } from "@/types/steam.types";
import { writable } from "svelte/store";

export const isTyping = writable<boolean>(false);
export const search = writable<string>("");
export const steamGames = writable<SteamGame[]>();
export const steamGamesByLetter = writable<SteamGamesByLetter>({});
