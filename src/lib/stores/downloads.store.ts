import DownloadCompleteToast from "@/components/toasts/download-complete-toast.svelte";
import { Downloader, DOWNLOADER_NAME } from "@/constants";
import { GofileApi } from "@/services/hosters/gofile";
import { commands, events } from "@/specta-bindings";
import { games, settings } from "@/stores";
import * as Types from "@/types";
import { getDownloaderFromUrl, transformDownloadUrl } from "@/utils";
import { exists, remove, stat } from "@tauri-apps/plugin-fs";
import type { ComponentType } from "svelte";
import { t } from "svelte-i18n";
import { toast } from "svelte-sonner";
import { get, writable } from "svelte/store";
import * as Persistent from "./persistent";

function createDownloadsStore() {
  const store = writable<Types.Download[]>([]);

  Persistent.downloads.get().then(async downloads => {
    if (!downloads) return;

    const validDownloads = await Promise.all(
      downloads.map(async download => {
        const downloadExists = await exists(download.path!);
        return downloadExists ? download : null;
      })
    )
      .then(downloads => downloads.filter(download => download !== null))
      .then(downloads =>
        Promise.all(
          downloads.map(async download => {
            const fileInfo = await stat(download.path!);

            return {
              ...download,
              downloaded_bytes: Math.max(fileInfo.size, download.downloaded_bytes!),
            };
          })
        )
      );
    Persistent.downloads.set(validDownloads);
    store.set(validDownloads);
  });

  /**
   *  Adds a new download and sets up a one-time listener for its start event.
   */
  const addDownload = async (
    url: string,
    remoteId: string,
    title: string,
    path: string,
    callback?: () => void
  ) => {
    const downloader = getDownloaderFromUrl(url);
    url = transformDownloadUrl(url);

    const listener = events.downloadEvent.listen(({ payload }) => {
      switch (payload.type) {
        case "started": {
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

            Persistent.downloads.set(state);

            return state;
          });

          if (callback) callback();

          listener.then(unlisten => unlisten());
          break;
        }
      }
    });

    switch (downloader) {
      case Downloader.Gofile: {
        const token = await GofileApi.authorize();
        const link = await GofileApi.getDownloadLink(url.split("/").pop()!);
        const fileName = link.split("/").pop()!;

        return commands.download(link, `${path}/${fileName}`, [
          ["Cookie", `accountToken=${token}`],
        ]);
      }
      case Downloader.PixelDrain: {
        const id = url.split("/").pop()!;
        const link = `https://cdn.pd5-gamedriveorg.workers.dev/api/file/${id}`;
        let fileName = title.replace(/\s/g, "-");

        return commands.download(link, `${path}/${fileName}`, null);
      }
      case Downloader.BuzzHeavier: {
        let fileName = title.replace(/\s/g, "-");

        return commands.download(url, `${path}/${fileName}`, null);
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
          const index = state.findIndex(download => download.url === data.url);
          state.splice(index, 1, { ...state[index], ...data, status: type });

          return state;
        });
        break;
      }
      case "completed": {
        store.update(state => {
          const index = state.findIndex(download => download.url === data.url);
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

          Persistent.downloads.set(state);

          return state;
        });

        if (get(settings).general.notifications.when_download_complete) {
          const download = get(store).find(download => download.url === data.url);
          const game = get(games).find(game => game.remote_id === download?.remote_id);

          toast(DownloadCompleteToast as unknown as ComponentType, {
            componentProps: { title: game?.title, iconUrl: game?.icon_url },
          });
        }
        break;
      }
      case "paused": {
        store.update(state => {
          const index = state.findIndex(download => download.url === data.url);
          state.splice(index, 1, { ...state[index], ...data, status: type, eta: 0 });

          Persistent.downloads.set(state);

          return state;
        });
        break;
      }
      case "aborted": {
        store.update(state => {
          const index = state.findIndex(download => download.url === data.url);
          state.splice(index, 1);

          Persistent.downloads.set(state);

          return state;
        });
        break;
      }
      case "rate_limit_exceeded": {
        toast.error(
          get(t)("downloads.rate_limit_exceeded", {
            values: { downloader: DOWNLOADER_NAME[getDownloaderFromUrl(data.url)] },
          }),
          {
            duration: 2000,
          }
        );
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
      const index = state.findIndex(download => download.url === url);
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
    url = transformDownloadUrl(url);
    const download = get(store).find(download => download.url === url);
    if (!download) return;

    const rangeHeader: [string, string] = [
      "Range",
      `bytes=${download.downloaded_bytes}-`,
    ];

    switch (download.downloader) {
      case Downloader.Gofile: {
        const token = await GofileApi.authorize();
        const link = await GofileApi.getDownloadLink(
          download.original_url.split("/").pop()!
        );

        return commands.download(link, download.path!, [
          rangeHeader,
          ["Cookie", `accountToken=${token}`],
        ]);
      }
      case Downloader.PixelDrain: {
        return commands.download(download.url, download.path!, [rangeHeader]);
      }
      case Downloader.BuzzHeavier: {
        return commands.download(download.url, download.path!, [rangeHeader]);
      }
      default: {
        // TODO: Implement resume download for other downloaders
        break;
      }
    }
  };

  /**
   * Removes a download from the store and deletes the associated file if it exists.
   */
  const removeDownload = async (url: string) => {
    const download = get(store).find(download => download.url === url);
    if (!download) return;

    const downloadExists = await exists(download.path!);

    if (downloadExists) {
      await remove(download.path!);
    }

    store.update(state => {
      const index = state.findIndex(download => download.url === url);
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
    removeDownload,
  };
}

export const downloads = createDownloadsStore();
