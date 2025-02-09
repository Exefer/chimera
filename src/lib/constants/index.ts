import * as Types from "@/types";
export { CHAR_MAP } from "./char-map";

export enum Downloader {
  Torrent,
  Gofile,
  PixelDrain,
  RealDebrid,
  Unknown,
}

export enum SteamContentDescriptor {
  SomeNudityOrSexualContent = 1,
  FrequenceViolenceOrGore = 2,
  AdultOnlySexualContent = 3,
  FrequentNudityOrSexualContent = 4,
  GeneralMatureContent = 5,
}

export const BYTES_TO_MEGABYTES = 1024 * 1024;

export const SEARCH_DEBOUNCE = 250;

export const ITEMS_PER_PAGE = 20;

export const DEFAULT_APP_SETTINGS: Types.AppSettings = {
  general: {
    downloads_path: "",
    theme: "system",
    locale: "en",
    notifications: {
      when_download_complete: false,
    },
  },
  behavior: {
    launch_minimized: false,
    launch_on_startup: false,
    minimize_to_tray: false,
    disable_nsfw_alert: false,
  },
  rqbit: {
    default_download_location: "",
    disable_upload: false,
    http_api: {
      disable: false,
      listen_addr: "",
      read_only: false,
    },
    peer_opts: {
      connect_timeout: 0,
      read_write_timeout: 0,
    },
    dht: {
      disable: false,
      disable_persistence: false,
      persistence_file: "",
    },
    tcp_listen: {
      disable: false,
      min_port: 0,
      max_port: 0,
    },
    upnp: {
      disable: false,
      enable_server: false,
      server_friendly_name: null,
    },
    persistence: {
      disable: false,
      fastresume: false,
      filename: "",
      folder: "",
    },
  },
};

export const DOWNLOADER_NAME: Record<Downloader, string> = {
  [Downloader.Torrent]: "Torrent",
  [Downloader.Gofile]: "Gofile",
  [Downloader.PixelDrain]: "PixelDrain",
  [Downloader.RealDebrid]: "Real-Debrid",
  [Downloader.Unknown]: "Generic HTTP",
};
