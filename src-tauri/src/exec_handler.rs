//! This module contains the logic for running executables with commands exposed to the frontend.
//!
//! It provides functionality for:
//! - Running executables
//! - Emitting events when executables start and finish
//! - Creating desktop shortcuts
use crate::Error;
use serde::{Deserialize, Serialize};
use specta::Type;
use std::{process::Command, time::Instant};
use tauri::{AppHandle, Manager};
use tauri_specta::Event;

#[derive(Serialize, Deserialize, Debug, Clone, Type, Event)]
#[serde(rename_all = "snake_case", tag = "type", content = "data")]
pub enum ExecutableEvent {
    Started { path: String },
    Finished { path: String, execution_time: u32 },
}

#[tauri::command]
#[specta::specta]
pub fn run_executable(app: AppHandle, path: String) -> Result<(), Error> {
    let mut command = Command::new(&path);

    let start_time = Instant::now();
    std::thread::spawn(move || {
        if let Ok(mut child) = command.spawn() {
            ExecutableEvent::Started { path: path.clone() }
                .emit(&app)
                .ok();

            if let Err(e) = child.wait() {
                Error::Other(e.to_string());
            }

            ExecutableEvent::Finished {
                path: path.clone(),
                execution_time: start_time.elapsed().as_secs() as u32,
            }
            .emit(&app)
            .ok();
        } else {
            eprintln!("command didn't start");
        }
    });
    Ok(())
}

#[tauri::command]
#[specta::specta]
#[cfg(target_os = "windows")]
pub fn create_shortcut(app: AppHandle, target_path: String) -> Result<(), Error> {
    // Path to the PowerShell script
    let ps_path = app
        .path()
        .resolve(
            "scripts/create_shortcut.ps1",
            tauri::path::BaseDirectory::Resource,
        )
        .unwrap();
    // Get the shortcut name from the target path
    let shortcut_name = target_path
        .rsplit('\\')
        .next()
        .unwrap_or_default()
        .replace(".exe", ".lnk");
    // Use PowerShell to execute the script
    match Command::new("powershell")
        .args([
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            &ps_path.display().to_string(),
            "-TargetPath",
            &target_path,
            "-ShortcutName",
            &shortcut_name,
        ])
        .output()
    {
        Ok(output) => {
            if output.status.success() {
                println!("Shortcut created successfully!");
            } else {
                eprintln!(
                    "Error creating shortcut: {}",
                    String::from_utf8_lossy(&output.stderr)
                );
            }
        }
        Err(e) => {
            eprintln!("Failed to execute PowerShell script: {}", e);
        }
    }
    Ok(())
}
