import { downloadsTable } from "@/database";
import { DownloadManager } from "@/services/download/download-manager";
import { setDownloads } from "@/stores";
import type { StartGameDownloadPayload } from "@/types";
import { remove } from "@tauri-apps/plugin-fs";
import { t } from "svelte-i18n";
import { toast } from "svelte-sonner";
import { get } from "svelte/store";

export function useDownload() {
  const updateDownloads = () =>
    DownloadManager.getDownloads().then(downloads => setDownloads(downloads));

  const startDownload = async (payload: StartGameDownloadPayload) => {
    const result = await DownloadManager.startDownload(payload);

    if (result.status === "error") {
      toast.error(get(t)("common.an_error_occurred"));
      throw result.error;
    }

    updateDownloads();
  };

  const pauseDownload = async (url: string) => {
    const download = await downloadsTable.where({ url }).first();

    if (!download) return;

    const result = await DownloadManager.pauseDownload(url);

    if (result.status === "error") {
      toast.error(get(t)("common.an_error_occurred"));
      throw result.error;
    }

    await downloadsTable.update(download.id, { status: "paused", eta: null });

    updateDownloads();
  };

  const abortDownload = async (url: string) => {
    const download = await downloadsTable.where({ url }).first();

    if (!download) return;

    const result = await DownloadManager.abortDownload(url);

    if (result.status === "error") {
      toast.error(get(t)("common.an_error_occurred"));
      throw result.error;
    }

    await downloadsTable.delete(download.id);

    remove(download.downloadPath!);

    updateDownloads();
  };

  const resumeDownload = async (url: string) => {
    const download = await downloadsTable.where({ originalUrl: url }).first();

    if (!download) return;

    try {
      await DownloadManager.resumeDownload(url);
    } catch (e) {
      toast.error(get(t)("common.an_error_occurred"));
      console.error(e);
    }

    updateDownloads();
  };

  return { updateDownloads, startDownload, pauseDownload, abortDownload, resumeDownload };
}
