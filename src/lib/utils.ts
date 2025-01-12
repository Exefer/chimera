import { CHAR_MAP } from "@/constants";
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

export const removeReleaseYearFromName = (name: string) =>
 name.replace(/\([0-9]{4}\)/g, "");

export const removeSymbolsFromName = (name: string) =>
 name.replace(/[^A-Za-z 0-9]/g, "");

export const removeSpecialEditionFromName = (name: string) =>
 name.replace(
  /(The |Digital )?(GOTY|Deluxe|Standard|Ultimate|Definitive|Enhanced|Collector's|Premium|Digital|Limited|Game of the Year|Reloaded|[0-9]{4}) Edition\w /gi,
  "",
 );

export const removeDuplicateSpaces = (name: string) =>
 name.replace(/\s{2,}/g, " ");

export const replaceDotsWithSpace = (name: string) => name.replace(/\./g, " ");

export const replaceNbspWithSpace = (name: string) =>
 name.replace(new RegExp(String.fromCharCode(160), "g"), " ");

export const replaceUnderscoreWithSpace = (name: string) =>
 name.replace(/_/g, " ");

export const formatName = pipe<string>(
 str =>
  str.replace(
   new RegExp(Object.keys(CHAR_MAP).join("|"), "g"),
   match => CHAR_MAP[match],
  ),
 str => str.toLowerCase(),
 removeReleaseYearFromName,
 removeSpecialEditionFromName,
 replaceUnderscoreWithSpace,
 replaceDotsWithSpace,
 replaceNbspWithSpace,
 str => str.replace(/DIRECTOR'S CUT/gi, ""),
 str => str.replace(/Friend's Pass/gi, ""),
 removeSymbolsFromName,
 removeDuplicateSpaces,
 str => str.trim(),
);

export const debounce = <T extends (...args: any[]) => any>(
 func: T,
 delay: number,
) => {
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

 return Types.Downloader.None;
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
