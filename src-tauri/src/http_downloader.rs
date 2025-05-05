use crate::{Error, HttpDownloaderState};
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use specta::Type;
use std::time::Duration;
use std::{path::PathBuf, time::Instant};
use tauri::{AppHandle, State};
use tauri_plugin_http::reqwest::{
    header::{HeaderMap, HeaderName, HeaderValue, CONTENT_DISPOSITION, CONTENT_TYPE, USER_AGENT},
    redirect::Policy,
    ClientBuilder as ReqwestClient, StatusCode,
};
use tauri_specta::Event;
use tokio::io::{AsyncWriteExt, BufWriter};
use tokio::sync::Mutex;

#[derive(Serialize, Deserialize, Debug, Clone, Type, Event)]
#[serde(rename_all = "snake_case", tag = "type", content = "data")]
pub enum DownloadEvent {
    Started {
        url: String,
        #[serde(rename = "downloadPath")]
        download_path: String,
        #[serde(rename = "fileSize")]
        content_length: u64,
    },
    Progress {
        url: String,
        progress: f64,
        #[serde(rename = "downloadedBytes")]
        downloaded_bytes: u64,
        #[serde(rename = "downloadSpeed")]
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
    RateLimitExceeded {
        url: String,
    },
}

const DEFAULT_USER_AGENT: &str = "chimera";

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

const PROGRESS_EVENT_EMISSION_INTERVAL: Duration = Duration::from_secs(1);

#[tauri::command(async)]
#[specta::specta]
pub async fn download(
    state: State<'_, Mutex<HttpDownloaderState>>,
    app: AppHandle,
    url: &str,
    dest_path: &str,
    headers: Option<Vec<(String, String)>>,
) -> Result<(), Error> {
    let mut dest_path = PathBuf::from(dest_path);
    let headers = parse_headers(headers);
    let mut downloaded_bytes = headers
        .get("Range")
        .and_then(|range| range.to_str().ok())
        .and_then(|s| s[6..s.len() - 1].parse::<u64>().ok())
        .unwrap_or(0);

    let response = ReqwestClient::new()
        .redirect(Policy::limited(3))
        .build()?
        .get(url)
        .headers(headers)
        .send()
        .await?;
    let headers = response.headers();
    let content_type = HeaderValue::from_static("");
    let content_type = headers
        .get(CONTENT_TYPE)
        .unwrap_or(&content_type)
        .to_str()
        .unwrap();

    if response.status() == StatusCode::TOO_MANY_REQUESTS {
        let _ = DownloadEvent::RateLimitExceeded {
            url: url.to_string(),
        }
        .emit(&app);
        return Err(Error::HttpClient("Too many requests".to_string()));
    }

    if content_type.starts_with("text/") {
        return Err(Error::HttpClient(
            "Request failed: server returned a text-based response, likely an error page"
                .to_string(),
        ));
    }

    if dest_path.extension().is_none() {
        let extension = match content_type {
            "application/x-rar-compressed" | "application/vnd.rar" => "rar",
            "application/zip" | "application/x-zip-compressed" => "zip",
            "application/x-7z-compressed" => "7z",
            _ => "",
        };
        dest_path.set_extension(extension);

        if extension.is_empty() {
            if let Some(content_disposition) = headers.get(CONTENT_DISPOSITION) {
                let mut parts = content_disposition.to_str().unwrap().split("; ");
                if parts.next() == Some("attachment") {
                    if let Some(param) = parts.next() {
                        let mut params = param.splitn(2, '=');
                        if let (Some(directive), Some(value)) = (params.next(), params.next()) {
                            let file_name = match directive {
                                "filename" => value.trim_matches('"'),
                                "filename*" => value.rsplit("''").next().unwrap_or(value),
                                _ => "",
                            };

                            if !file_name.is_empty() {
                                dest_path.set_file_name(file_name);
                            }
                        }
                    }
                }
            }
        }
    }

    let content_length = response
        .content_length()
        .ok_or_else(|| Error::HttpClient("Unable to parse content length".to_string()))?;
    let content_length = downloaded_bytes + content_length;
    let session_start_offset = downloaded_bytes;

    let start_time = Instant::now();
    let mut last_progress_emit = Instant::now();

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
    let mut stream = response.bytes_stream();

    let _ = DownloadEvent::Started {
        url: url.to_string(),
        download_path: dest_path.display().to_string(),
        content_length,
    }
    .emit(&app);

    if downloaded_bytes == 0 {
        println!("Started downloading {} to {:#?}", url, dest_path);
    } else {
        println!(
            "Resuming download of {:#?} from {:#?} bytes",
            dest_path, downloaded_bytes
        );
    }

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        writer.write_all(&chunk).await?;
        downloaded_bytes += chunk.len() as u64;

        if last_progress_emit.elapsed() >= PROGRESS_EVENT_EMISSION_INTERVAL {
            let state = state.lock().await;

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
            let progress = downloaded_bytes as f64 / content_length as f64 * 100.0;

            let _ = DownloadEvent::Progress {
                url: url.to_string(),
                progress,
                downloaded_bytes,
                download_speed,
                eta,
            }
            .emit(&app);

            if let Some(abort_download) = &state.abort_download {
                if abort_download == url {
                    writer.shutdown().await?;
                    tokio::fs::remove_file(dest_path).await?;
                    let _ = DownloadEvent::Aborted {
                        url: url.to_string(),
                    }
                    .emit(&app);

                    println!("Download aborted");

                    break;
                }
            }

            if let Some(pause_download) = &state.pause_download {
                if pause_download == url {
                    writer.shutdown().await?;
                    let _ = DownloadEvent::Paused {
                        url: url.to_string(),
                    }
                    .emit(&app);

                    println!("Download paused");

                    break;
                }
            }

            last_progress_emit = Instant::now();
        }
    }
    writer.flush().await?;
    let state = state.lock().await;

    if state.abort_download.is_none() && state.pause_download.is_none() {
        let _ = DownloadEvent::Completed {
            url: url.to_string(),
        }
        .emit(&app);

        println!("Download completed");
    }

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn abort_download(
    state: State<'_, Mutex<HttpDownloaderState>>,
    url: String,
) -> Result<(), Error> {
    let mut state = state.lock().await;
    state.abort_download = Some(url);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn pause_download(
    state: State<'_, Mutex<HttpDownloaderState>>,
    url: String,
) -> Result<(), Error> {
    let mut state = state.lock().await;
    state.pause_download = Some(url);
    Ok(())
}
