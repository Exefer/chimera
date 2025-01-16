import {
 type DownloadProgressEvent,
 commands,
 events,
} from "@/specta-bindings";
import * as Types from "@/types";
import { getDownloaderFromUrl } from "@/utils";
import { get, writable } from "svelte/store";
import { settings } from "./settings.store";

interface Download extends Partial<DownloadProgressEvent> {
 title: string;
 url: string;
 remote_id: string;
 downloader: Types.Downloader;
 content_length: number;
 status: "progress" | "paused" | "completed" | "aborted";
 path?: string;
}

function createDownloadsStore() {
 const store = writable<Download[]>([]);

 const addDownload = (url: string, remoteId: string, title: string) => {
  store.update(state => {
   if (state.find(download => download.url == url)) {
    return state;
   }
   commands.download(url, get(settings).downloadsPath + "/test.zip", null);
   events.downloadStartedEvent.once(({ payload }) => {
    state.push({
     ...payload,
     title,
     url,
     remote_id: remoteId,
     downloader: getDownloaderFromUrl(url),
     status: "progress",
    });
   });

   return state;
  });
 };

 const pauseDownload = commands.pauseDownload;

 const abortDownload: (
  ...args: Parameters<typeof commands.abortDownload>
 ) => void = url => {
  commands.abortDownload(url);
  store.update(state => {
   const index = state.findIndex(download => download.url == url);
   state.splice(index, 1);

   return state;
  });
 };

 const resumeDownload: (
  ...args: Parameters<typeof commands.resumeDownload>
 ) => void = (url, path, downloadedBytes) => {
  commands.resumeDownload(url, path, downloadedBytes);
  store.update(state => {
   const index = state.findIndex(download => download.url == url);
   state.splice(index, 1, { ...state[index], status: "progress" });

   return state;
  });
 };

 events.downloadProgressEvent.listen(({ payload }) => {
  store.update(state => {
   const index = state.findIndex(download => download.url == payload.url);
   state.splice(index, 1, { ...state[index], ...payload });

   return state;
  });
 });

 events.downloadCompletedEvent.listen(({ payload }) => {
  store.update(state => {
   const index = state.findIndex(download => download.url == payload.url);
   const download = state[index];
   delete download["remaining_bytes"];
   delete download["download_speed"];
   delete download["progress"];
   delete download["eta"];

   state.splice(index, 1, {
    ...download,
    ...payload,
    status: "completed",
   });

   return state;
  });
 });

 events.downloadPausedEvent.listen(({ payload }) => {
  store.update(state => {
   const index = state.findIndex(download => download.url == payload.url);
   state.splice(index, 1, { ...state[index], ...payload, status: "paused" });

   return state;
  });
 });

 events.downloadAbortedEvent.listen(({ payload }) => {
  store.update(state => {
   const index = state.findIndex(download => download.url == payload.url);
   state.splice(index, 1);

   return state;
  });
 });

 return {
  ...store,
  addDownload,
  pauseDownload,
  resumeDownload,
  abortDownload,
 };
}

export const downloads = createDownloadsStore();
