import { DEFAULT_APP_SETTINGS } from "@/constants/";
import * as Types from "@/types";
import { writable } from "svelte/store";
import * as Persistent from "./persistent";
import { TorrentApi } from "@/raw-bindings";

function createSettingsStore() {
  const store = writable<Types.AppSettings>(DEFAULT_APP_SETTINGS);

  TorrentApi.getDefaultTorrentConfig().then(config => {
    store.update(state => ({
      ...state,
      rqbit: config,
    }));
  });

  Persistent.settings.get().then(settings => {
    if (settings)
      store.update(state => ({
        general: { ...state.general, ...settings.general },
        behavior: { ...state.behavior, ...settings.behavior },
        rqbit: { ...state.rqbit, ...settings.rqbit },
      }));
    store.subscribe(async settings => {
      await Persistent.settings.set(settings);
    });
  });

  return { ...store };
}

export const settings = createSettingsStore();
