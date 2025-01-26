//! This module contains the logic for downloading files over HTTPS with commands exposed to the frontend.
//!
//! It provides functionality for:
//! - Downloading files with progress tracking
//! - Pausing/resuming downloads
//! - Aborting downloads
//! - Custom headers
use crate::constants::DEFAULT_USER_AGENT;
use crate::{constants::PROGRESS_EVENT_SKIP, AppState, Error};
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use specta::Type;
use std::{path::Path, time::Instant};
use tauri::State;
use tauri::{http::HeaderName, AppHandle};
use tauri_plugin_http::reqwest::{
    header::{HeaderMap, USER_AGENT},
    redirect::Policy,
    ClientBuilder as ReqwestClient,
};
use tauri_specta::Event;
use tokio::io::{AsyncWriteExt, BufWriter};
use tokio::sync::Mutex;

#[derive(Serialize, Deserialize, Debug, Clone, Type, Event)]
#[serde(rename_all = "lowercase", tag = "type", content = "data")]
pub enum DownloadEvent {
    Started {
        url: String,
        path: String,
        content_length: u64,
    },
    Progress {
        url: String,
        progress_percentage: f64,
        downloaded_bytes: u64,
        download_speed: u64,
        eta: u64,
    },
    Paused {
        url: String,
    },
    Completed {
        url: String,
    },
    Aborted {
        url: String,
    },
}

fn parse_headers(custom_headers: Option<Vec<(String, String)>>) -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, DEFAULT_USER_AGENT.parse().unwrap());

    if let Some(custom_headers) = custom_headers {
        for (key, value) in custom_headers {
            headers.insert(key.parse::<HeaderName>().unwrap(), value.parse().unwrap());
        }
    }
    headers
}

#[specta::specta]
#[tauri::command]
pub async fn download(
    state: State<'_, Mutex<AppState>>,
    app: AppHandle,
    url: &str,
    dest_path: &str,
    headers: Option<Vec<(String, String)>>,
) -> Result<(), Error> {
    let dest_path = Path::new(dest_path);
    let headers = parse_headers(headers);

    if let Some(parent) = dest_path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }

    let mut downloaded_bytes = if let Some(range) = headers.get("Range") {
        range.to_str().unwrap()[6..range.len() - 1]
            .parse::<u64>()
            .unwrap_or(0)
    } else {
        0
    };

    let response = ReqwestClient::new()
        .redirect(Policy::limited(3))
        .build()?
        .get(url)
        .headers(headers)
        .send()
        .await?;
    let content_length = response
        .content_length()
        .ok_or_else(|| Error::Other("Unable to parse content length".to_string()))?;
    let content_length = downloaded_bytes + content_length;
    DownloadEvent::Started {
        url: url.to_string(),
        path: dest_path.display().to_string(),
        content_length,
    }
    .emit(&app)
    .ok();

    let start_time = Instant::now();
    let mut current_iteration: u32 = 0;
    // Track the offset at the start of the session, used for resumed requests
    let session_start_offset = downloaded_bytes;
    let mut download_aborted = false;
    let mut download_paused = false;
    let mut writer = BufWriter::new(
        tokio::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&dest_path)
            .await?,
    );
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        writer.write_all(&chunk).await?;
        downloaded_bytes += chunk.len() as u64;

        if current_iteration % PROGRESS_EVENT_SKIP == 0 {
            let mut state = state.lock().await;
            if let Some(abort_download) = &state.abort_download {
                if abort_download == url {
                    writer.shutdown().await?;
                    tokio::fs::remove_file(dest_path).await?;
                    DownloadEvent::Aborted {
                        url: url.to_string(),
                    }
                    .emit(&app)
                    .ok();
                    download_aborted = true;
                    state.abort_download = None;
                    break;
                }
            }
            let elapsed = start_time.elapsed().as_secs();
            // Use session-specific downloaded bytes to avoid incorrect ETA and download speed on resume
            let session_downloaded_bytes = downloaded_bytes - session_start_offset;
            let download_speed = if elapsed > 0 {
                session_downloaded_bytes / elapsed
            } else {
                0
            };
            let eta = if download_speed > 0 {
                (content_length - downloaded_bytes) / download_speed
            } else {
                0
            };
            let progress_percentage = downloaded_bytes as f64 / content_length as f64 * 100.0;
            DownloadEvent::Progress {
                url: url.to_string(),
                progress_percentage,
                downloaded_bytes,
                download_speed,
                eta,
            }
            .emit(&app)
            .ok();
            if let Some(pause_download) = &state.pause_download {
                if pause_download == url {
                    writer.shutdown().await?;
                    DownloadEvent::Paused {
                        url: url.to_string(),
                    }
                    .emit(&app)
                    .ok();
                    download_paused = true;
                    state.pause_download = None;
                    break;
                }
            }
        }
        current_iteration += 1;
    }
    writer.flush().await?;
    if !download_aborted && !download_paused {
        DownloadEvent::Completed {
            url: url.to_string(),
        }
        .emit(&app)
        .ok();
    }
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn abort_download(state: State<'_, Mutex<AppState>>, url: String) -> Result<(), Error> {
    let mut state = state.lock().await;
    state.abort_download = Some(url);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn pause_download(state: State<'_, Mutex<AppState>>, url: String) -> Result<(), Error> {
    let mut state = state.lock().await;
    state.pause_download = Some(url);
    Ok(())
}
