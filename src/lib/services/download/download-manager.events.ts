import DownloadCompleteToast from "@/components/toasts/download-complete-toast.svelte";
import { DOWNLOADER_NAME } from "@/constants";
import { downloadsTable, libraryTable } from "@/database";
import { useDownload } from "@/hooks";
import { commands, type DownloadEvent } from "@/specta-bindings";
import { settings } from "@/stores";
import { getDownloaderForUrl } from "@/utils";
import type { ComponentType } from "svelte";
import { t } from "svelte-i18n";
import { toast } from "svelte-sonner";
import { get } from "svelte/store";

const { updateDownloads } = useDownload();

export const onDownloadProgress = async (
  data: Extract<DownloadEvent, { type: "progress" }>["data"]
) => {
  await downloadsTable.where({ url: data.url }).modify({ ...data, status: "progress" });

  updateDownloads();
};

export const onDownloadCompleted = async (
  data: Extract<DownloadEvent, { type: "completed" }>["data"]
) => {
  await downloadsTable
    .where({ url: data.url })
    .modify({ status: "completed", progress: 100, downloadSpeed: 0, eta: null });

  updateDownloads();

  const download = await downloadsTable.where({ url: data.url }).first();

  console.log(download);

  if (!download) return;

  if (get(settings).downloadNotificationsEnabled) {
    const game = await libraryTable.where({ objectId: download.objectId }).first();

    if (!game) return;

    toast(DownloadCompleteToast as unknown as ComponentType, {
      componentProps: { title: game.title, iconUrl: game.iconUrl },
    });
  }

  if (download?.automaticallyExtract) {
    const result = await commands.extractArchive(download.downloadPath, null);

    if (result.status === "error") throw result.error;

    toast.success(get(t)("notifications.extraction_complete:title"), {
      description: get(t)("notifications.extraction_complete:description", {
        values: {
          title: download.title,
        },
      }),
    });
  }
};

export const onDownloadRateLimitExceeded = async (
  data: Extract<DownloadEvent, { type: "rate_limit_exceeded" }>["data"]
) => {
  toast.error(
    get(t)("downloads.rate_limit_exceeded", {
      values: { downloader: DOWNLOADER_NAME[getDownloaderForUrl(data.url)] },
    }),
    {
      duration: 2000,
    }
  );
};

export const _onDownloadAborted = async (
  _data: Extract<DownloadEvent, { type: "aborted" }>["data"]
) => {};

export const _onDownloadPaused = async (
  _data: Extract<DownloadEvent, { type: "paused" }>["data"]
) => {};
