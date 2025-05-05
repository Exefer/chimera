import type { AppSettings } from "@/types";
import { writable } from "svelte/store";
import * as Persistent from "./persistent";

const initialState: AppSettings = {
  downloadsPath: null,
  theme: "system",
  locale: "en",
  downloadNotificationsEnabled: false,
  launchMinimized: false,
  runAtStartp: false,
  minimizeToTray: false,
  disableNsfwAlert: false,
  extractFilesByDefault: true,
};

function createSettingsStore() {
  const store = writable<AppSettings>(initialState);

  Persistent.settings.get().then(settings => {
    if (settings) store.update(state => ({ ...state, ...settings }));
    store.subscribe(async settings => {
      await Persistent.settings.set(settings);
    });
  });

  return { ...store };
}

export const settings = createSettingsStore();
