import type { AppLocale, Downloader } from "@/constants";
import type { DownloadEvent } from "@/specta-bindings";

export type { AppLocale, LocaleEntry } from "@/constants";

export type AppTheme = "light" | "dark" | "system";

export interface AppSettings {
  downloadsPath: string | null;
  theme: AppTheme;
  locale: AppLocale;
  downloadNotificationsEnabled: boolean;
  launchMinimized: boolean;
  runAtStartp: boolean;
  minimizeToTray: boolean;
  disableNsfwAlert: boolean;
  extractFilesByDefault: boolean;
}

export interface DownloadSourceValidationResult {
  name: string;
  etag: string;
  downloadCount: number;
}

export interface DownloadSource {
  name: string;
  downloads: SourceDownload[];
}

export interface SourceDownload {
  title: string;
  fileSize: string;
  uris: string[];
  uploadDate: string;
}

export interface Pack extends SourceDownload {
  packer: string;
  objectIds: string[];
}

export interface Game {
  title: string;
  objectId: string;
  executablePath: string | null;
  launchOptions: string | null;
  iconUrl: string | null;
  playtimeInSeconds: number;
  lastPlayedAt: number | null;
  size: number | null;
  running: boolean;
  favorite: boolean;
}

type StatusValues = Exclude<
  DownloadEvent extends { type: infer T } ? T : never,
  "started"
>;

export interface Download {
  title: string;
  originalUrl: string;
  url: string;
  objectId: string;
  downloadPath: string;
  downloader: Downloader;
  status: StatusValues;
  queued: boolean;
  extracting: boolean;
  automaticallyExtract: boolean;
  progress: number;
  downloadedBytes: number;
  fileSize: number;
  downloadSpeed: number;
  eta: number | null;
}

export type StartGameDownloadPayload = Pick<
  Download,
  "url" | "title" | "objectId" | "downloadPath" | "downloader" | "automaticallyExtract"
>;

export type SteamGamesByLetter = Record<string, Array<{ name: string; id: string }>>;
