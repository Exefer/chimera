use crate::consts::PROGRESS_EVENT_SKIP;
use crate::{
    AppState, DownloadAbortedEvent, DownloadCompletedEvent, DownloadPausedEvent,
    DownloadProgressEvent, DownloadStartedEvent, Error,
};
use futures::StreamExt;
use log::info;
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

fn parse_headers(custom_headers: Option<Vec<(&str, &str)>>) -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, "chimera".parse().unwrap());

    if let Some(custom_headers) = custom_headers {
        for (key, value) in custom_headers {
            #[cfg(debug_assertions)]
            {
                println!("{key}: {value}");
            }
            headers.insert(key.parse::<HeaderName>().unwrap(), value.parse().unwrap());
        }
    }
    headers
}

fn calculate_remaining_bytes(content_length: u64, downloaded_bytes: u64) -> u64 {
    if downloaded_bytes > content_length {
        0 // Prevents underflow
    } else {
        content_length - downloaded_bytes
    }
}

#[specta::specta]
#[tauri::command]
pub async fn download(
    state: State<'_, Mutex<AppState>>,
    app: AppHandle,
    url: &str,
    dest_path: &str,
    custom_headers: Option<Vec<(&str, &str)>>,
) -> Result<(), Error> {
    let dest_path = Path::new(dest_path);
    let headers = parse_headers(custom_headers);

    if let Some(parent) = dest_path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }

    let mut writer = BufWriter::new(
        tokio::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&dest_path)
            .await?,
    );

    let response = ReqwestClient::new()
        .cookie_store(true)
        .redirect(Policy::limited(3))
        .build()?
        .get(url)
        .headers(headers.clone())
        .send()
        .await?;

    let content_length = response
        .content_length()
        .ok_or_else(|| Error::Other("Unable to parse content length".to_string()))?;
    let mut downloaded_bytes = if let Some(range) = headers.get("Range") {
        range.to_str().unwrap()[6..range.len() - 1]
            .parse::<u64>()
            .unwrap_or(0)
    } else {
        0
    };

    let total_length = downloaded_bytes + content_length;

    let _ = DownloadStartedEvent {
        url: url.to_string(),
        path: dest_path.display().to_string(),
        content_length: total_length,
    }
    .emit(&app);

    let start_time = Instant::now();
    // Track the offset at the start of the session, used for resumed requests
    let session_start_offset = downloaded_bytes;
    let mut current_iteration: u64 = 0;
    let mut download_aborted = false;
    let mut download_paused = false;
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
                    let _ = DownloadAbortedEvent {
                        url: url.to_string(),
                    }
                    .emit(&app);
                    download_aborted = true;
                    state.abort_download = None;
                    break;
                }
            }

            let elapsed = start_time.elapsed().as_secs();
            // Use session-specific downloaded bytes to avoid incorrect ETA and download speed on resume
            let session_downloaded_bytes = downloaded_bytes - session_start_offset;
            let remaining_bytes = calculate_remaining_bytes(total_length, downloaded_bytes);
            let download_speed = if elapsed > 0 {
                session_downloaded_bytes / elapsed
            } else {
                0
            };
            let eta = if download_speed > 0 {
                remaining_bytes / download_speed
            } else {
                0
            };

            let progress = downloaded_bytes as f64 / total_length as f64 * 100.0;
            let _ = DownloadProgressEvent {
                url: url.to_string(),
                progress,
                remaining_bytes,
                download_speed,
                eta,
            }
            .emit(&app);

            if let Some(pause_download) = &state.pause_download {
                if pause_download == url {
                    writer.shutdown().await?;
                    let _ = DownloadPausedEvent {
                        url: url.to_string(),
                    }
                    .emit(&app);
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
        let _ = DownloadCompletedEvent {
            url: url.to_string(),
        }
        .emit(&app);
    }

    info!(
        "Download {} for {url}",
        if download_aborted {
            "aborted"
        } else if download_paused {
            "paused"
        } else {
            "completed"
        }
    );

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn resume_download(
    state: State<'_, Mutex<AppState>>,
    app: AppHandle,
    url: &str,
    dest_path: &str,
    downloaded_bytes: u64,
) -> Result<(), Error> {
    download(
        state,
        app,
        url,
        dest_path,
        Some(vec![("Range", &format!("bytes={downloaded_bytes}-"))]),
    )
    .await
}

#[tauri::command]
#[specta::specta]
pub async fn abort_download(
    state: State<'_, Mutex<AppState>>,
    url: Option<String>,
) -> Result<(), Error> {
    let mut state = state.lock().await;
    if let Some(url) = url {
        state.abort_download = Some(url);
    } else {
        state.abort_download = None
    }
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn pause_download(
    state: State<'_, Mutex<AppState>>,
    url: Option<String>,
) -> Result<(), Error> {
    let mut state = state.lock().await;
    if let Some(url) = url {
        state.pause_download = Some(url);
    } else {
        state.pause_download = None
    }
    Ok(())
}
