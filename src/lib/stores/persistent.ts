import type { AppSettings } from "@/types";
import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore("store.json", { autoSave: true });

export const settings = {
  get: () => store.get<AppSettings>("settings"),
  set: async (value: AppSettings) => {
    await store.set("settings", value);
  },
};
