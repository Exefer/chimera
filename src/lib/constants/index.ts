import * as Types from "@/types";
export { CHAR_MAP } from "./char-map";

export const BYTES_TO_MEGABYTES = 1024 * 1024;

export const SEARCH_DEBOUNCE = 250;

export const ITEMS_PER_PAGE = 20;

export const DEFAULT_APP_SETTINGS: Types.AppSettings = {
 // General
 downloadsPath: "",
 theme: "system",
 locale: "en",
 // General - Notifications
 notifyOnDownloadComplete: false,
 // Behavior
 launchMinimized: false,
 launchOnStartup: false,
 minimizeToTray: false,
};

export const DOWNLOADER_NAMES: Record<Types.Downloader, string> = {
 [Types.Downloader.Gofile]: "Gofile",
 [Types.Downloader.RealDebrid]: "Real-Debrid",
 [Types.Downloader.Torrent]: "Torrent",
 [Types.Downloader.Unknown]: "Generic HTTP",
};
