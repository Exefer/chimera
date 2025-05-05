use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::AppHandle;
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

#[derive(Debug, Serialize, Deserialize)]
enum FileDelta {
    New,
    Same,
}

#[derive(Debug, Serialize, Deserialize)]
struct FileEntry {
    change: FileDelta,
    bytes: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupReport(HashMap<String, FileEntry>);

pub struct Ludasavi;

impl Ludasavi {
    pub fn new() -> Self {
        Self
    }

    pub fn setup_cloud(&self, app: &AppHandle) {
        let ludusavi = app.shell().sidecar("ludusavi").unwrap();
        let (mut rx, mut _child) = ludusavi
            .args(["cloud", "set", "google-drive"])
            .spawn()
            .expect("Failed to spawn sidecar");

        tauri::async_runtime::spawn(async move {
            // read events such as stdout
            while let Some(event) = rx.recv().await {
                if let CommandEvent::Error(error) = event {
                    println!("Error: {}", error);
                }
            }
        });
    }

    pub async fn backup_game(
        &self,
        app: &AppHandle,
        title: &str,
        backup_path: &str,
        preview: bool,
        wine_prefix: Option<&str>,
        extra_args: Option<Vec<&str>>,
    ) -> Result<String, String> {
        let mut args = vec!["backup", title, "--path", backup_path, "--api", "--force"];

        if preview {
            args.push("--preview");
        }

        if let Some(wine_prefix) = wine_prefix {
            args.push("--wine-prefix");
            args.push(wine_prefix);
        }

        if let Some(extra_args) = extra_args {
            args.extend(extra_args)
        }

        let ludusavi = app.shell().sidecar("ludusavi").unwrap();
        let (mut rx, mut _child) = ludusavi
            .args(args)
            .spawn()
            .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

        let mut buffer = String::new();

        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line_bytes) = event {
                let line = String::from_utf8_lossy(&line_bytes);
                buffer.push_str(&line);
            } else if let CommandEvent::Error(error) = event {
                return Err(format!("Command error: {}", error));
            }
        }

        Ok(buffer)
    }

    pub async fn restore_backup(
        &self,
        app: &AppHandle,
        backup_path: &str,
    ) -> Result<BackupReport, String> {
        let ludusavi = app.shell().sidecar("ludusavi").unwrap();
        let (mut rx, mut _child) = ludusavi
            .args(["restore", "--path", backup_path, "--api", "--force"])
            .spawn()
            .expect("Failed to spawn sidecar");

        let mut buffer = String::new();

        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line_bytes) = event {
                let line = String::from_utf8_lossy(&line_bytes);
                buffer.push_str(&line);
            } else if let CommandEvent::Error(error) = event {
                return Err(format!("Command error: {}", error));
            }
        }

        match serde_json::from_str::<BackupReport>(&buffer) {
            Ok(parsed) => Ok(parsed),
            Err(_) => Err("No valid data received".into()),
        }
    }
}
