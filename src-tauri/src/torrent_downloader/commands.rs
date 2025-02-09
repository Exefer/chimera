use super::config;
use anyhow::Context;
use config::ChimeraConfig;
use librqbit::{
    api::{
        ApiAddTorrentResponse, EmptyJsonResponse, TorrentDetailsResponse, TorrentIdOrHash,
        TorrentListResponse, TorrentStats,
    },
    dht::PersistentDhtConfig,
    session_stats::snapshot::SessionStatsSnapshot,
    AddTorrent, AddTorrentOptions, Api, ApiError, PeerConnectionOptions, Session, SessionOptions,
    SessionPersistenceConfig,
};
use parking_lot::RwLock;
use serde::Serialize;
use std::{
    fs::{File, OpenOptions},
    io::{BufReader, BufWriter},
    path::Path,
    sync::Arc,
};
use tauri::http::StatusCode;
use tracing::{error, warn};

const ERR_NOT_CONFIGURED: ApiError =
    ApiError::new_from_text(StatusCode::FAILED_DEPENDENCY, "not configured");

/// Represents the shared state of the application, including configuration and API instance.
pub struct TorrentingState {
    config: config::ChimeraConfig,
    api: Option<Api>,
}

/// Main state holder for the application, managing configuration and shared state.
pub struct AppTorrentingState {
    config_file_path: String,
    shared_state: Arc<RwLock<Option<TorrentingState>>>,
}

/// Reads the configuration from a file and returns a `ChimeraConfig` object.
fn load_configuration(file_path: &str) -> anyhow::Result<ChimeraConfig> {
    let reader = BufReader::new(File::open(file_path)?);
    let mut config: ChimeraConfig = serde_json::from_reader(reader)?;
    config.persistence.fix_backwards_compat();
    Ok(config)
}

/// Writes the configuration to a file.
fn save_configuration(file_path: &str, config: &ChimeraConfig) -> anyhow::Result<()> {
    std::fs::create_dir_all(Path::new(file_path).parent().context("no parent")?)
        .context("error creating dirs")?;
    let temp_file_path = format!("{}.tmp", file_path);
    let mut temp_file = BufWriter::new(
        OpenOptions::new()
            .write(true)
            .truncate(true)
            .create(true)
            .open(&temp_file_path)?,
    );
    serde_json::to_writer(&mut temp_file, config)?;
    std::fs::rename(temp_file_path, file_path)?;
    Ok(())
}

/// Initializes the API instance using the provided configuration.
async fn initialize_api(config: &ChimeraConfig) -> anyhow::Result<Api> {
    config
        .validate()
        .context("error validating configuration")?;
    let persistence = if config.persistence.disable {
        None
    } else {
        Some(SessionPersistenceConfig::Json {
            folder: if config.persistence.folder == Path::new("") {
                None
            } else {
                Some(config.persistence.folder.clone())
            },
        })
    };
    let session = Session::new_with_opts(
        config.default_download_location.clone(),
        SessionOptions {
            disable_dht: config.dht.disable,
            disable_dht_persistence: config.dht.disable_persistence,
            dht_config: Some(PersistentDhtConfig {
                config_filename: Some(config.dht.persistence_file.clone()),
                ..Default::default()
            }),
            persistence,
            peer_opts: Some(PeerConnectionOptions {
                connect_timeout: Some(config.peer_opts.connect_timeout),
                read_write_timeout: Some(config.peer_opts.read_write_timeout),
                ..Default::default()
            }),
            listen_port_range: if !config.tcp_listen.disable {
                Some(config.tcp_listen.min_port..config.tcp_listen.max_port)
            } else {
                None
            },
            enable_upnp_port_forwarding: !config.upnp.disable_tcp_port_forward,
            fastresume: config.persistence.fastresume,
            ..Default::default()
        },
    )
    .await
    .context("couldn't set up librqbit session")?;

    let api = Api::new(session.clone(), None, None);

    Ok(api)
}

impl AppTorrentingState {
    /// Creates a new instance of `AppTorrentingState` and initializes it with the configuration.
    pub async fn new() -> Self {
        let config_file_path = dirs::data_dir()
            .unwrap()
            .join("com.chimera.app")
            .join("config.json")
            .to_str()
            .expect("to_str()")
            .to_owned();

        if let Ok(config) = load_configuration(&config_file_path) {
            let api = initialize_api(&config)
                .await
                .map_err(|e| {
                    warn!(error=?e, "error reading configuration");
                    e
                })
                .ok();
            let shared_state = Arc::new(RwLock::new(Some(TorrentingState { config, api })));

            return Self {
                config_file_path,
                shared_state,
            };
        }

        Self {
            config_file_path,
            shared_state: Arc::new(RwLock::new(None)),
        }
    }

    /// Retrieves the API instance from the shared state.
    fn get_api(&self) -> Result<Api, ApiError> {
        let state = self.shared_state.read();
        match state.as_ref().and_then(|s| s.api.as_ref()) {
            Some(api) => Ok(api.clone()),
            None => Err(ERR_NOT_CONFIGURED),
        }
    }

    /// Updates the configuration and reinitializes the API if necessary.
    async fn update_configuration(&self, config: ChimeraConfig) -> Result<(), ApiError> {
        {
            let state = self.shared_state.read();
            if let Some(shared) = state.as_ref() {
                if shared.api.is_some() && shared.config == config {
                    // The configuration hasn't changed, and the API is already running.
                    return Ok(());
                }
            }
        }

        let existing_api = self
            .shared_state
            .write()
            .as_mut()
            .and_then(|s| s.api.take());

        if let Some(api) = existing_api {
            api.session().stop().await;
        }

        let api = initialize_api(&config).await?;
        if let Err(e) = save_configuration(&self.config_file_path, &config) {
            error!("error writing config: {:#}", e);
        }

        let mut state = self.shared_state.write();
        *state = Some(TorrentingState {
            config,
            api: Some(api),
        });
        Ok(())
    }
}

/// Represents the current state of the application, including configuration and whether it's configured.
#[derive(Default, Serialize)]
pub struct TorrentConfigStatus {
    config: Option<ChimeraConfig>,
    configured: bool,
}

#[tauri::command]
pub fn get_default_torrent_configuration() -> config::ChimeraConfig {
    config::ChimeraConfig::default()
}

#[tauri::command]
pub fn get_current_torrent_configuration(
    state: tauri::State<'_, AppTorrentingState>,
) -> TorrentConfigStatus {
    let state = state.shared_state.read();
    match &*state {
        Some(s) => TorrentConfigStatus {
            config: Some(s.config.clone()),
            configured: s.api.is_some(),
        },
        None => Default::default(),
    }
}

#[tauri::command]
pub async fn apply_torrent_configuration(
    state: tauri::State<'_, AppTorrentingState>,
    config: ChimeraConfig,
) -> Result<EmptyJsonResponse, ApiError> {
    state
        .update_configuration(config)
        .await
        .map(|_| EmptyJsonResponse {})
}

#[tauri::command]
pub fn list_torrents(
    state: tauri::State<AppTorrentingState>,
) -> Result<TorrentListResponse, ApiError> {
    Ok(state.get_api()?.api_torrent_list())
}

#[tauri::command]
pub async fn add_torrent_from_url(
    state: tauri::State<'_, AppTorrentingState>,
    url: String,
    options: Option<AddTorrentOptions>,
) -> Result<ApiAddTorrentResponse, ApiError> {
    state
        .get_api()?
        .api_add_torrent(AddTorrent::Url(url.into()), options)
        .await
}

#[tauri::command]
pub async fn get_torrent_details(
    state: tauri::State<'_, AppTorrentingState>,
    id: TorrentIdOrHash,
) -> Result<TorrentDetailsResponse, ApiError> {
    state.get_api()?.api_torrent_details(id)
}

#[tauri::command]
pub async fn get_torrent_statistics(
    state: tauri::State<'_, AppTorrentingState>,
    id: TorrentIdOrHash,
) -> Result<TorrentStats, ApiError> {
    state.get_api()?.api_stats_v1(id)
}

#[tauri::command]
pub async fn delete_torrent(
    state: tauri::State<'_, AppTorrentingState>,
    id: TorrentIdOrHash,
) -> Result<EmptyJsonResponse, ApiError> {
    state.get_api()?.api_torrent_action_delete(id).await
}

#[tauri::command]
pub async fn pause_torrent(
    state: tauri::State<'_, AppTorrentingState>,
    id: TorrentIdOrHash,
) -> Result<EmptyJsonResponse, ApiError> {
    state.get_api()?.api_torrent_action_pause(id).await
}

#[tauri::command]
pub async fn forget_torrent(
    state: tauri::State<'_, AppTorrentingState>,
    id: TorrentIdOrHash,
) -> Result<EmptyJsonResponse, ApiError> {
    state.get_api()?.api_torrent_action_forget(id).await
}

#[tauri::command]
pub async fn start_torrent(
    state: tauri::State<'_, AppTorrentingState>,
    id: TorrentIdOrHash,
) -> Result<EmptyJsonResponse, ApiError> {
    state.get_api()?.api_torrent_action_start(id).await
}

#[tauri::command]
pub async fn configure_torrent_files(
    state: tauri::State<'_, AppTorrentingState>,
    id: TorrentIdOrHash,
    only_files: Vec<usize>,
) -> Result<EmptyJsonResponse, ApiError> {
    state
        .get_api()?
        .api_torrent_action_update_only_files(id, &only_files.into_iter().collect())
        .await
}

#[tauri::command]
pub async fn get_torrent_session_stats(
    state: tauri::State<'_, AppTorrentingState>,
) -> Result<SessionStatsSnapshot, ApiError> {
    Ok(state.get_api()?.api_session_stats())
}
