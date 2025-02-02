import { Downloader } from "@/constants";
import { GoFileApi } from "@/services/hosters/gofile";
import { commands, events } from "@/specta-bindings";
import * as Types from "@/types";
import { getDownloaderFromUrl } from "@/utils";
import { get, writable } from "svelte/store";
import * as Persistent from "./persistent";

function createDownloadsStore() {
  const store = writable<Types.Download[]>([]);
  Persistent.downloads.get().then(downloads => {
    if (downloads) store.set(downloads);
  });

  /**
   *  Adds a new download and sets up a one-time listener for its start event.
   */
  const addDownload = async (
    url: string,
    remoteId: string,
    title: string,
    path: string
  ) => {
    const state = get(store);
    const download = state.find(download => download.url == url);
    if (download) return;

    const downloader = getDownloaderFromUrl(url);

    const listener = events.downloadEvent.listen(({ payload }) => {
      switch (payload.type) {
        case "started": {
          Promise.all(
            state.map(async download => await commands.pauseDownload(download.url))
          ).then(() => {
            store.update(state => {
              state.push({
                ...payload.data,
                original_url: url,
                title,
                downloader,
                remote_id: remoteId,
                status: "progress",
                progress_percentage: 0,
                downloaded_bytes: 0,
              });

              return state;
            });
          });

          listener.then(unlisten => unlisten());
          break;
        }
      }
    });

    switch (downloader) {
      case Downloader.Gofile: {
        const token = await GoFileApi.authorize();
        const link = await GoFileApi.getDownloadLink(url.split("/").pop()!);
        const filename = link.split("/").pop()!;
        commands.download(link, `${path}/${filename}`, [
          ["Cookie", `accountToken=${token}`],
        ]);
        break;
      }
      default: {
        // TODO: Implement download for other downloaders
        break;
      }
    }
  };

  /**
   * Listen for download events from the backend and update store state accordingly.
   * Events include progress updates, completion, pausing and aborting.
   */
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
          // Clean up progress-related fields on completion
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

  /**
   * Request the backend to pause a download.
   *
   * The pause is not instantaneous - the backend will continue downloading
   * until the next progress check interval before actually pausing.
   * A "paused" event will be emitted when the download is actually paused (max 2 seconds delay).
   */
  const pauseDownload = commands.pauseDownload;

  /**
   * Request the backend to abort a download.
   *
   * The abort this is not instantaneous - the backend will stop at the next progress check.
   * The downloaded file will be deleted and an "aborted" event will be emitted.
   */
  const abortDownload = (url: string) => {
    commands.abortDownload(url);
    store.update(state => {
      const index = state.findIndex(download => download.url == url);
      state.splice(index, 1);

      return state;
    });
  };

  /**
   * Resume a paused download.
   *
   * Uses the Range header to continue from where the download was paused.
   * The download will restart with a "progress" status.
   */
  const resumeDownload = async (url: string) => {
    const download = get(store).find(download => download.url == url);
    if (!download) return;

    switch (download.downloader) {
      case Downloader.Gofile: {
        const token = await GoFileApi.authorize();
        const link = await GoFileApi.getDownloadLink(
          download.original_url.split("/").pop()!
        );
        commands.download(link, download.path!, [
          ["Range", `bytes=${download.downloaded_bytes}-`],
          ["Cookie", `accountToken=${token}`],
        ]);
        break;
      }
      default: {
        // TODO: Implement resume download for other downloaders
        break;
      }
    }
    store.update(state => {
      const index = state.findIndex(download => download.url == url);
      const download = state[index];
      state.splice(index, 1, { ...download, status: "progress" });

      return state;
    });
  };

  const deleteDownload = async (url: string) => {
    const download = get(store).find(download => download.url == url);
    if (!download) return;

    if (await commands.exists(download.path!)) {
      await commands.deleteFile(download.path!);
    }

    store.update(state => {
      const index = state.findIndex(download => download.url == url);
      state.splice(index, 1);

      return state;
    });
  };

  return {
    ...store,
    addDownload,
    pauseDownload,
    resumeDownload,
    abortDownload,
    deleteDownload,
  };
}

export const downloads = createDownloadsStore();
