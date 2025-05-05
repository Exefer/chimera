use serde::de::{self, Deserializer};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::AppHandle;
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

#[derive(Debug, Serialize, Deserialize)]
struct RcloneToken {
    access_token: String,
    token_type: String,
    refresh_token: String,
    expiry: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RcloneConfigDump {
    scope: String,
    team_drive: String,
    #[serde(deserialize_with = "deserialize_token")]
    token: RcloneToken,
    #[serde(rename = "type")]
    type_: String,
}

fn deserialize_token<'de, D>(deserializer: D) -> Result<RcloneToken, D::Error>
where
    D: Deserializer<'de>,
{
    // Deserialize the token field as a string
    let token_str: String = Deserialize::deserialize(deserializer)?;

    // Now parse that string as JSON into a RcloneToken
    serde_json::from_str(&token_str).map_err(de::Error::custom)
}

pub struct Rclone;

impl Rclone {
    pub fn new() -> Self {
        Self
    }

    pub async fn dump_config(
        &self,
        app: &AppHandle,
    ) -> Result<HashMap<String, RcloneConfigDump>, String> {
        let rclone = app.shell().sidecar("rclone").unwrap();
        let (mut rx, _child) = rclone
            .args(["config", "dump"])
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

        match serde_json::from_str::<HashMap<String, RcloneConfigDump>>(&buffer) {
            Ok(parsed) => Ok(parsed),
            Err(_) => Err("No valid config data received".into()),
        }
    }
}
