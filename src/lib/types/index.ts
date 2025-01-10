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

export interface LibraryItem {
 title: string;
 id: number;
}

export enum Downloader {
 Torrent,
 Gofile,
}

export interface Game {
 title: string;
 remoteId: number;
 iconUrl?: string | null;
 executablePath?: string;
 launchOptions?: string;
 playtimeInSeconds?: number;
 lastPlayedAt?: number;
 createdAt?: number;
 updatedAt?: number;
 size?: number;
}
