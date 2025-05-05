export { CHAR_MAP } from "./char-map";

export const SEARCH_DEBOUNCE = 250;

export const ITEMS_PER_PAGE = 16;

export const STEAM_GAMES_URL =
  "https://raw.githubusercontent.com/hydralauncher/hydra/refs/heads/main/seeds/steam-games.json";

export const APP_LANGUAGES = {
  en: { name: "English", localizedName: "English", flag: "🇺🇸" },
  it: { name: "Italian", localizedName: "Italiano", flag: "🇮🇹" },
} as const;
export type LocaleEntry = (typeof APP_LANGUAGES)[AppLocale];
export type AppLocale = keyof typeof APP_LANGUAGES;

export enum Downloader {
  Torrent,
  Gofile,
  PixelDrain,
  BuzzHeavier,
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

export enum DownloadSourceStatus {
  UpToDate,
  Errored,
}

export enum CatalogueCategory {
  Hot = "hot",
  Weekly = "weekly",
  Achievements = "achievements",
}

export const DOWNLOADER_NAME: Record<Downloader, string> = {
  [Downloader.Torrent]: "Torrent",
  [Downloader.Gofile]: "Gofile",
  [Downloader.PixelDrain]: "PixelDrain",
  [Downloader.RealDebrid]: "Real-Debrid",
  [Downloader.BuzzHeavier]: "BuzzHeavier",
  [Downloader.Unknown]: "Unknown",
};
