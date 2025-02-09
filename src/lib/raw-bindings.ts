import type { TorrentAPI } from "@/types/raw-bindings.types";
import { invoke } from "@tauri-apps/api/core";

export const TorrentApi: TorrentAPI = {
  getDefaultConfiguration: () => {
    return invoke("get_default_torrent_configuration");
  },
  getPlaylistUrl: index => {
    throw new Error("Function not implemented.");
  },
  getStreamLogsUrl: () => {
    throw new Error("Function not implemented.");
  },
  listTorrents: () => {
    throw new Error("Function not implemented.");
  },
  getTorrentDetails: index => {
    throw new Error("Function not implemented.");
  },
  getTorrentStats: index => {
    throw new Error("Function not implemented.");
  },
  getTorrentStreamUrl: (index, file_id, filename) => {
    throw new Error("Function not implemented.");
  },
  addTorrentFromUrl: (url, opts) => {
    return invoke("add_torrent_from_url", { url, opts });
  },
  pause: index => {
    throw new Error("Function not implemented.");
  },
  updateOnlyFiles: (index, files) => {
    throw new Error("Function not implemented.");
  },
  start: index => {
    throw new Error("Function not implemented.");
  },
  forget: index => {
    throw new Error("Function not implemented.");
  },
  delete: index => {
    throw new Error("Function not implemented.");
  },
  stats: () => {
    return invoke("get_torrent_session_stats");
  },
  applyConfiguration: config => {
    return invoke("apply_torrent_configuration", { config });
  },
};
