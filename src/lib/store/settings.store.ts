import * as Persistent from "@/store/persistent";
import * as Types from "@/types";
import { writable } from "svelte/store";

const initialState: Types.AppSettings = {
 // General
 downloadsPath: "",
 theme: "system",
 // General - Notifications
 notifyOnDownloadComplete: false,
 // Behavior
 launchMinimized: false,
 launchOnStartup: false,
 minimizeToTray: false,
};

function createSettingsStore() {
 const store = writable<Types.AppSettings>(initialState);

 Persistent.settings.get().then(settings => {
  if (settings) store.update(state => ({ ...state, ...settings }));
  store.subscribe(async settings => await Persistent.settings.set(settings));
 });

 const updateSettings = (newSettings: Partial<Types.AppSettings>) => {
  store.update(state => ({
   ...state,
   ...newSettings,
  }));
 };

 return { ...store, updateSettings };
}

export const settingsStore = createSettingsStore();
