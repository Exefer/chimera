export type AppTheme = "light" | "dark" | "system";

export interface AppSettings {
 downloadsPath: string;
 theme: AppTheme;
 notifyOnDownloadComplete: boolean;
 launchOnStartup: boolean;
 launchMinimized: boolean;
 minimizeToTray: boolean;
}

export interface Source {
 name: string;
 url: string;
 downloads: SourceDownload[];
}

export interface SourceDownload {
 title: string;
 fileSize: string;
 uris: string[];
 uploadDate: string;
}

export interface Game {
 title: string;
 remoteId: string;
 iconUrl?: string;
 executablePath?: string;
 launchOptions?: string;
 playtimeInSeconds: number;
 lastPlayedAt: number;
 createdAt: number;
 size?: number;
 running: boolean;
}

export enum Downloader {
 Torrent,
 Gofile,
 None,
}
