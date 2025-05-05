import type { DownloadEntry } from "@/database";
import { writable } from "svelte/store";

function createDownloadsStore() {
  const store = writable<DownloadEntry[]>([]);

  const setDownloads = async (value: DownloadEntry[]) => {
    store.set(value);
  };

  return { ...store, setDownloads };
}

export const downloads = createDownloadsStore();

export const { setDownloads } = downloads;
