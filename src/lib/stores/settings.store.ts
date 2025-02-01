import { DEFAULT_APP_SETTINGS } from "@/constants/";
import * as Types from "@/types";
import { writable } from "svelte/store";
import * as Persistent from "./persistent";

function createSettingsStore() {
  const store = writable<Types.AppSettings>(DEFAULT_APP_SETTINGS);

  Persistent.settings.get().then(settings => {
    if (settings)
      store.update(state => ({
        general: { ...state.general, ...settings.general },
        behavior: { ...state.behavior, ...settings.behavior },
      }));
    store.subscribe(async settings => {
      await Persistent.settings.set(settings);
    });
  });

  return { ...store };
}

export const settings = createSettingsStore();
