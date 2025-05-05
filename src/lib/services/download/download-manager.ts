import { Downloader } from "@/constants";
import { downloadsTable } from "@/database";
import { GofileApi } from "@/services/hosters/gofile";
import { commands, events } from "@/specta-bindings";
import type { Download, StartGameDownloadPayload } from "@/types";
import { transformDownloadUrl } from "@/utils";
import { path } from "@tauri-apps/api";

type DownloadHeaders = Parameters<typeof commands.download>[2];

export class DownloadManager {
  public static getDownloads() {
    return downloadsTable.toArray();
  }

  public static async startDownload(
    download: StartGameDownloadPayload,
    callback?: () => void
  ) {
    const { title, objectId, downloader, automaticallyExtract } = download;
    const {
      headers,
      downloadPath,
      url,
      fileName = title.replace(/\s/g, "-"),
    } = await this.getDownloadPayload(download);

    const listener = events.downloadEvent.listen(async ({ payload }) => {
      switch (payload.type) {
        case "started": {
          const { fileSize, downloadPath: finalDownloadPath } = payload.data;
          await downloadsTable.where({ objectId }).delete();

          await downloadsTable.add({
            title,
            objectId,
            url,
            downloadPath: finalDownloadPath,
            originalUrl: download.url,
            queued: false,
            extracting: false,
            eta: null,
            downloadSpeed: 0,
            progress: 0,
            downloadedBytes: 0,
            fileSize,
            status: "progress",
            downloader,
            automaticallyExtract,
          });

          if (callback) callback();

          listener.then(unlisten => unlisten());

          break;
        }
      }
    });

    return commands.download(
      url,
      await path.join(downloadPath, fileName),
      headers as DownloadHeaders
    );
  }

  public static async resumeDownload(url: string) {
    const download = await downloadsTable.where({ originalUrl: url }).first();

    if (!download) return;

    const payload = await this.getDownloadPayload({ ...download, url: url });

    const rangeHeader = ["Range", `bytes=${download.downloadedBytes}-`];

    payload.headers = payload.headers ? [...payload.headers, rangeHeader] : [rangeHeader];

    return commands.download(
      payload.url,
      payload.downloadPath,
      payload.headers as DownloadHeaders
    );
  }

  public static async pauseDownload(url: string) {
    return commands.pauseDownload(url);
  }

  public static async abortDownload(url: string) {
    return commands.abortDownload(url);
  }

  private static async getDownloadPayload(
    download: Pick<Download, "url" | "downloadPath" | "downloader">
  ) {
    const url = transformDownloadUrl(download.url);
    switch (download.downloader) {
      case Downloader.Gofile: {
        const token = await GofileApi.authorize();
        const downloadLink = await GofileApi.getDownloadLink(url.split("/").pop()!);
        const fileName = downloadLink.split("/").pop()!;

        return {
          url: downloadLink,
          fileName,
          downloadPath: download.downloadPath,
          headers: [["Cookie", `accountToken=${token}`]],
        };
      }
      case Downloader.PixelDrain: {
        const id = url.split("/").pop()!;
        const link = `https://cdn.pd5-gamedriveorg.workers.dev/api/file/${id}`;

        return {
          url: link,
          downloadPath: download.downloadPath,
          headers: null,
        };
      }
      case Downloader.BuzzHeavier: {
        return {
          url,
          downloadPath: download.downloadPath,
          headers: null,
        };
      }
      default: {
        throw new Error("Unsupported downloader");
      }
    }
  }
}
