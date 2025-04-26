import * as Types from "@/types";
import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore("store.json", { autoSave: true });

export const settings = {
  get: () => store.get<Types.AppSettings>("settings"),
  set: async (value: Types.AppSettings) => {
    await store.set("settings", value);
  },
};

export const games = {
  get: () => store.get<Types.Game[]>("games") ?? [],
  set: async (value: Types.Game[]) => {
    await store.set("games", value);
  },
};

export const downloads = {
  get: () => store.get<Types.Download[]>("downloads") ?? [],
  set: async (value: Types.Download[]) => {
    await store.set("downloads", value);
  },
};
