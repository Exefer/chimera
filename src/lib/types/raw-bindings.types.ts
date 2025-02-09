export interface TorrentAPIConfig {
  default_download_location: string;
  disable_upload: boolean;
  dht: {
    disable: boolean;
    disable_persistence: boolean;
    persistence_file: string;
  };
  tcp_listen: {
    disable: boolean;
    min_port: number;
    max_port: number;
  };
  upnp: {
    disable: boolean;
    enable_server: boolean;
    server_friendly_name: string | null;
  };
  persistence: {
    disable: boolean;
    folder: string;
    fastresume: boolean;
    filename: string;
  };
  peer_opts: {
    connect_timeout: number;
    read_write_timeout: number;
  };
  http_api: {
    disable: boolean;
    listen_addr: string;
    read_only: boolean;
  };
}

// Interface for the Torrent API response
export interface TorrentId {
  id: number;
  info_hash: string;
}

export interface TorrentFile {
  name: string;
  components: string[];
  length: number;
  included: boolean;
  attributes: TorrentFileAttributes;
}

export interface TorrentFileAttributes {
  symlink: boolean;
  hidden: boolean;
  padding: boolean;
  executable: boolean;
}

export interface TorrentDetails {
  name: string | null;
  info_hash: string;
  files: Array<TorrentFile>;
}

export interface AddTorrentResponse {
  id: number | null;
  details: TorrentDetails;
  output_folder: string;
  seen_peers?: Array<string>;
}

export interface ListTorrentsResponse {
  torrents: Array<TorrentId>;
}

export interface Speed {
  mbps: number;
  human_readable: string;
}

export interface AggregatePeerStats {
  queued: number;
  connecting: number;
  live: number;
  seen: number;
  dead: number;
  not_needed: number;
}

export interface SessionStats {
  download_speed: Speed;
  upload_speed: Speed;
  fetched_bytes: number;
  uploaded_bytes: number;
  peers: AggregatePeerStats;
  uptime_seconds: number;
}

// Interface for the Torrent Stats API response
export interface LiveTorrentStats {
  snapshot: {
    have_bytes: number;
    downloaded_and_checked_bytes: number;
    downloaded_and_checked_pieces: number;
    fetched_bytes: number;
    uploaded_bytes: number;
    initially_needed_bytes: number;
    remaining_bytes: number;
    total_bytes: number;
    total_piece_download_ms: number;
    peer_stats: AggregatePeerStats;
  };
  average_piece_download_time: {
    secs: number;
    nanos: number;
  };
  download_speed: Speed;
  upload_speed: Speed;
  all_time_download_speed: {
    mbps: number;
    human_readable: string;
  };
  time_remaining: {
    human_readable: string;
    duration?: {
      secs: number;
    };
  } | null;
}

export interface TorrentStats {
  state: "initializing" | "paused" | "live" | "error";
  error: string | null;
  file_progress: number[];
  progress_bytes: number;
  finished: boolean;
  total_bytes: number;
  live: LiveTorrentStats | null;
}

export interface ErrorDetails {
  id?: number;
  method?: string;
  path?: string;
  status?: number;
  statusText?: string;
  text: string;
}

export type Duration = number;

export interface PeerConnectionOptions {
  connect_timeout?: Duration | null;
  read_write_timeout?: Duration | null;
  keep_alive_interval?: Duration | null;
}

export interface AddTorrentOptions {
  paused?: boolean;
  only_files_regex?: string | null;
  only_files?: number[] | null;
  overwrite?: boolean;
  list_only?: boolean;
  output_folder?: string | null;
  sub_folder?: string | null;
  peer_opts?: PeerConnectionOptions | null;
  force_tracker_interval?: Duration | null;
  initial_peers?: string[] | null; // Assuming SocketAddr is equivalent to a string in TypeScript
  preferred_id?: number | null;
}

export type Value = string | number | boolean;

export interface Span {
  name: string;
  [key: string]: Value;
}

export interface JSONLogLine {
  level: string;
  timestamp: string;
  fields: {
    message: string;
    [key: string]: Value;
  };
  target: string;
  span: Span;
  spans: Span[];
}

export interface TorrentAPI {
  getDefaultTorrentConfig: () => Promise<TorrentAPIConfig>;
  getPlaylistUrl: (index: number) => string | null;
  getStreamLogsUrl: () => string | null;
  listTorrents: () => Promise<ListTorrentsResponse>;
  getTorrentDetails: (index: number) => Promise<TorrentDetails>;
  getTorrentStats: (index: number) => Promise<TorrentStats>;
  getTorrentStreamUrl: (
    index: number,
    file_id: number,
    filename?: string | null
  ) => string | null;
  addTorrentFromUrl: (
    url: string,
    opts?: AddTorrentOptions
  ) => Promise<AddTorrentResponse>;
  pause: (index: number) => Promise<void>;
  updateOnlyFiles: (index: number, files: number[]) => Promise<void>;
  start: (index: number) => Promise<void>;
  forget: (index: number) => Promise<void>;
  delete: (index: number) => Promise<void>;
  stats: () => Promise<SessionStats>;
  applyTorrentConfig: (config: TorrentAPIConfig) => Promise<void>;
}
