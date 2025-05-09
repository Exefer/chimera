#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cloud_sync;
mod exec_handler;
mod fs_utils;
mod http_downloader;
use tauri::Manager;
use tokio::sync::Mutex;

#[derive(Default)]
pub struct HttpDownloaderState {
    abort_download: Option<String>,
    pause_download: Option<String>,
}

#[derive(Debug, specta::Type, thiserror::Error)]
pub enum Error {
    /// IO errors
    #[error(transparent)]
    IoError(
        #[from]
        #[serde(skip)] // io::Error is not `Serialize` or `specta::Type`
        std::io::Error,
    ),
    /// HTTP errors
    #[error("Request timed out: \"{0}\"")]
    Timeout(String),
    #[error("Request returned non-200 status: \"{0}\"")]
    StatusCode(String),
    #[error("Error executing request: \"{0}\"")]
    RequestFailed(String),
    #[error("Error parsing body as json: \"{0}\"")]
    ParsingFailed(String),
    /// Catch-all reqwest errors
    #[error("HTTP Client Error: \"{0}\"")]
    HttpClient(String),
    /// Tauri errors
    #[error("Tauri error: {0}")]
    TauriError(String),
    /// Other errors
    #[error("{0}")]
    Other(String),
}

impl Error {
    #[must_use]
    pub const fn code(&self) -> &'static str {
        match self {
            Error::IoError(_) => "IoError",
            Error::Timeout(_) => "Timeout",
            Error::StatusCode(_) => "StatusCode",
            Error::RequestFailed(_) => "RequestFailed",
            Error::ParsingFailed(_) => "ParsingFailed",
            Error::HttpClient(_) => "HttpClient",
            Error::TauriError(_) => "TauriError",
            Error::Other(_) => "Other",
        }
    }
}

impl From<tauri_plugin_http::reqwest::Error> for Error {
    fn from(source: tauri_plugin_http::reqwest::Error) -> Self {
        if source.is_timeout() {
            Self::Timeout(source.to_string())
        } else if source.is_status() {
            Self::StatusCode(source.to_string())
        } else if source.is_decode() {
            Self::ParsingFailed(source.to_string())
        } else if source.is_request() {
            Self::RequestFailed(source.to_string())
        } else {
            Self::HttpClient(source.to_string())
        }
    }
}

impl From<unrar::error::UnrarError> for Error {
    fn from(source: unrar::error::UnrarError) -> Self {
        Self::Other(source.to_string())
    }
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

fn main() {
    let builder = tauri_specta::Builder::<tauri::Wry>::new()
        .commands(tauri_specta::collect_commands![
            exec_handler::start_process,
            exec_handler::create_shortcut,
            exec_handler::kill_process,
            exec_handler::is_process_running,
            http_downloader::download,
            http_downloader::abort_download,
            http_downloader::pause_download,
            fs_utils::extract_archive,
        ])
        .events(tauri_specta::collect_events![
            http_downloader::DownloadEvent,
            exec_handler::ProcessEvent
        ]);

    #[cfg(debug_assertions)]
    builder
        .export(
            specta_typescript::Typescript::default()
                .bigint(specta_typescript::BigIntExportBehavior::Number)
                .header("// @ts-nocheck"),
            "../src/lib/specta-bindings.ts",
        )
        .expect("Failed to export typescript bindings");
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            builder.mount_events(app);

            app.manage(Mutex::new(HttpDownloaderState::default()));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
