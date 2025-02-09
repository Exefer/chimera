import type {
  AddTorrentOptions,
  AddTorrentResponse,
  ListTorrentsResponse,
  SessionStats,
  TorrentAPI,
  TorrentAPIConfig,
  TorrentDetails,
  TorrentStats,
} from "@/types/raw-bindings.types";
import { invoke } from "@tauri-apps/api/core";

export const TorrentApi: TorrentAPI = {
  getDefaultTorrentConfig: () => {
    return invoke("get_default_torrent_configuration");
  },
  getPlaylistUrl: (index: number): string | null => {
    throw new Error("Function not implemented.");
  },
  getStreamLogsUrl: (): string | null => {
    throw new Error("Function not implemented.");
  },
  listTorrents: (): Promise<ListTorrentsResponse> => {
    throw new Error("Function not implemented.");
  },
  getTorrentDetails: (index: number): Promise<TorrentDetails> => {
    throw new Error("Function not implemented.");
  },
  getTorrentStats: (index: number): Promise<TorrentStats> => {
    throw new Error("Function not implemented.");
  },
  getTorrentStreamUrl: (
    index: number,
    file_id: number,
    filename?: string | null
  ): string | null => {
    throw new Error("Function not implemented.");
  },
  addTorrentFromUrl: (
    url: string,
    opts?: AddTorrentOptions
  ): Promise<AddTorrentResponse> => {
    return invoke("add_torrent_from_url", { url, opts });
  },
  pause: (index: number): Promise<void> => {
    throw new Error("Function not implemented.");
  },
  updateOnlyFiles: (index: number, files: number[]): Promise<void> => {
    throw new Error("Function not implemented.");
  },
  start: (index: number): Promise<void> => {
    throw new Error("Function not implemented.");
  },
  forget: (index: number): Promise<void> => {
    throw new Error("Function not implemented.");
  },
  delete: (index: number): Promise<void> => {
    throw new Error("Function not implemented.");
  },
  stats: (): Promise<SessionStats> => {
    return invoke("get_torrent_session_stats");
  },
  applyTorrentConfig: (config: TorrentAPIConfig): Promise<void> => {
    return invoke("apply_torrent_configuration", { config });
  },
};
