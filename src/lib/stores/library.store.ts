import type { LibraryGame } from "@/database";
import { writable } from "svelte/store";

function createLibraryStore() {
  const store = writable<LibraryGame[]>([]);

  const setLibrary = async (value: LibraryGame[]) => {
    store.set(value);
  };

  return { ...store, setLibrary };
}

export const library = createLibraryStore();

export const { setLibrary } = library;
