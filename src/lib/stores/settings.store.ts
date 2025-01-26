import { DEFAULT_APP_SETTINGS } from "@/constants/";
import * as Persistent from "@/stores/persistent";
import * as Types from "@/types";
import { writable } from "svelte/store";

function createSettingsStore() {
 const store = writable<Types.AppSettings>(DEFAULT_APP_SETTINGS);

 Persistent.settings.get().then(settings => {
  if (settings) store.update(state => ({ ...state, ...settings }));
  store.subscribe(async settings => {
   await Persistent.settings.set(settings);
  });
 });

 const updateSettings = (newSettings: Partial<Types.AppSettings>) => {
  store.update(state => ({
   ...state,
   ...newSettings,
  }));
 };

 return { ...store, updateSettings };
}

export const settings = createSettingsStore();
