import { GoFileApi } from "@/services/hosters/gofile";
import { type DownloadEvent, commands, events } from "@/specta-bindings";
import * as Types from "@/types";
import { getDownloaderFromUrl } from "@/utils";
import { get, writable } from "svelte/store";

type StatusValues = Exclude<
 DownloadEvent extends { type: infer T } ? T : never,
 "started"
>;
type ProgressEvent = Extract<DownloadEvent, { type: "progress" }>;
type Download = Partial<ProgressEvent["data"]> & {
 title: string;
 url: string;
 remote_id: string;
 downloader: Types.Downloader;
 content_length: number;
 status: StatusValues;
 path?: string;
};

function createDownloadsStore() {
 const store = writable<Download[]>([]);

 const addDownload = async (
  url: string,
  remoteId: string,
  title: string,
  path: string,
 ) => {
  const state = get(store);
  if (state.find(download => download.url == url)) return;

  const downloader = getDownloaderFromUrl(url);

  const listener = events.downloadEvent.listen(({ payload }) => {
   switch (payload.type) {
    case "started": {
     store.update(state => {
      console.log("Payload: ", payload.data);
      state.push({
       ...payload.data,
       title,
       downloader,
       remote_id: remoteId,
       status: "progress",
      });

      return state;
     });
     listener.then(unlisten => unlisten());
     break;
    }
   }
  });

  switch (downloader) {
   case Types.Downloader.Torrent: {
    // TODO: Implement torrent download
    break;
   }
   case Types.Downloader.Gofile: {
    const token = await GoFileApi.authorize();
    const link = await GoFileApi.getDownloadLink(url.split("/").pop()!);
    const filename = link.split("/").pop()!;
    console.log(`${path}/${filename}`);
    commands.download(link, `${path}/${filename}`, [["Cookie", `accountToken=${token}`]]);

    break;
   }
   case Types.Downloader.RealDebrid: {
    // TODO: Implement RealDebrid download
    break;
   }
   case Types.Downloader.Unknown: {
    // TODO: Implement unknown download
    break;
   }
  }
 };

 events.downloadEvent.listen(({ payload: { type, data } }) => {
  switch (type) {
   case "progress": {
    store.update(state => {
     const index = state.findIndex(download => download.url == data.url);
     state.splice(index, 1, { ...state[index], ...data });

     return state;
    });
    break;
   }
   case "completed": {
    store.update(state => {
     const index = state.findIndex(download => download.url == data.url);
     const download = state[index];
     delete download["downloaded_bytes"];
     delete download["download_speed"];
     delete download["progress_percentage"];
     delete download["eta"];
     state.splice(index, 1, {
      ...download,
      ...data,
      status: type,
     });

     return state;
    });
    break;
   }
   case "paused": {
    store.update(state => {
     const index = state.findIndex(download => download.url == data.url);
     state.splice(index, 1, { ...state[index], ...data, status: type });

     return state;
    });
    break;
   }
   case "aborted": {
    store.update(state => {
     const index = state.findIndex(download => download.url == data.url);
     state.splice(index, 1);

     return state;
    });
    break;
   }
  }
 });

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

 const resumeDownload = (url: string) => {
  store.update(state => {
   const index = state.findIndex(download => download.url == url);
   const download = state[index];
   commands.download(url, download.path!, [
    ["Range", `bytes=${download.downloaded_bytes}-`],
   ]);
   state.splice(index, 1, { ...download, status: "progress" });

   return state;
  });
 };

 return {
  ...store,
  addDownload,
  pauseDownload,
  resumeDownload,
  abortDownload,
 };
}

export const downloads = createDownloadsStore();
