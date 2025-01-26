import { CHAR_MAP } from "@/constants/";
import * as Types from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export const capitalize = (string: string) =>
 string.charAt(0).toUpperCase() + string.slice(1);

export const pipe =
 <T>(...fns: ((arg: T) => any)[]) =>
 (arg: T) =>
  fns.reduce((prev, fn) => fn(prev), arg);

export const removeReleaseYearFromTitle = (title: string) =>
 title.replace(/\([0-9]{4}\)/g, "");

export const removeSymbolsFromTitle = (title: string) =>
 title.replace(/[^A-Za-z 0-9]/g, "");

export const removeSpecialEditionFromTitle = (title: string) =>
 title.replace(
  /(The |Digital )?(GOTY|Deluxe|Standard|Ultimate|Definitive|Enhanced|Collector's|Premium|Digital|Limited|Game of the Year|Reloaded|[0-9]{4}) Edition\w /gi,
  "",
 );

export const removeDuplicateSpaces = (title: string) => title.replace(/\s{2,}/g, " ");

export const replaceDotsWithSpace = (title: string) => title.replace(/\./g, " ");

export const replaceNbspWithSpace = (title: string) =>
 title.replace(new RegExp(String.fromCharCode(160), "g"), " ");

export const replaceUnderscoreWithSpace = (title: string) => title.replace(/_/g, " ");

export const formatTitle = pipe<string>(
 str =>
  str.replace(new RegExp(Object.keys(CHAR_MAP).join("|"), "g"), match => CHAR_MAP[match]),
 str => str.toLowerCase(),
 removeReleaseYearFromTitle,
 removeSpecialEditionFromTitle,
 replaceUnderscoreWithSpace,
 replaceDotsWithSpace,
 replaceNbspWithSpace,
 str => str.replace(/DIRECTOR'S CUT/gi, ""),
 str => str.replace(/Friend's Pass/gi, ""),
 removeSymbolsFromTitle,
 removeDuplicateSpaces,
 str => str.trim(),
);

export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
 let timeout: NodeJS.Timeout | null = null;

 return (...args: Parameters<T>) => {
  if (timeout) clearTimeout(timeout);

  timeout = setTimeout(() => {
   func.apply(this, args);
  }, delay);
 };
};

export const getDownloaderFromUrl = (url: string) => {
 if (url.startsWith("https://gofile.io")) return Types.Downloader.Gofile;
 if (url.startsWith("magnet:")) return Types.Downloader.Torrent;
 if (url.startsWith("https://1fichier.com")) return Types.Downloader.RealDebrid;

 return Types.Downloader.Unknown;
};

export const formatBytes = (size: number) => {
 const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB"];
 let unitIndex = 0;

 while (size >= 1024 && unitIndex < units.length - 1) {
  size /= 1024;
  unitIndex++;
 }

 return `${size.toFixed(1)} ${units[unitIndex]}`;
};
