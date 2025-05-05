import type { PackEntry } from "@/database";
import { writable } from "svelte/store";

function createPacksStore() {
  const store = writable<PackEntry[]>([]);

  const setPacks = async (value: PackEntry[]) => {
    store.set(value);
  };

  return { ...store, setPacks };
}

export const packs = createPacksStore();

export const { setPacks } = packs;
