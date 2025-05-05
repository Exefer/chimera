use crate::Error;
use serde::{Deserialize, Serialize};
use specta::Type;
use std::{path::Path, process::Command, time::Instant};
use sysinfo::System;
use tauri::{AppHandle, Manager};
use tauri_specta::Event;

#[derive(Debug, Serialize, Deserialize, Clone, Type, Event)]
#[serde(rename_all = "snake_case", tag = "type", content = "data")]
pub enum ProcessEvent {
    Started {
        path: String,
    },
    Finished {
        path: String,
        #[serde(rename = "executionTime")]
        execution_time: u32,
    },
}

#[derive(Debug, Serialize, Deserialize, Clone, Type)]
#[serde(rename_all = "snake_case")]
pub enum ShortcutLocation {
    Desktop,
    Shell,
}

#[tauri::command]
#[specta::specta]
pub fn start_process(app: AppHandle, path: String, events: bool) -> Result<(), Error> {
    let start_time = Instant::now();

    std::thread::spawn(move || match Command::new(&path).spawn() {
        Ok(mut child_process) => {
            if events {
                ProcessEvent::Started { path: path.clone() }.emit(&app).ok();
            }

            if child_process.wait().is_err() {
                eprintln!("Failed to wait for child process");
            }

            if events {
                let _ = ProcessEvent::Finished {
                    path,
                    execution_time: start_time.elapsed().as_secs() as u32,
                }
                .emit(&app);
            }
        }
        Err(error) => {
            eprintln!("Failed to start process: {error}");
        }
    });

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn is_process_running(path: String) -> bool {
    let process_name = Path::new(&path)
        .file_name()
        .and_then(|file_name| file_name.to_str())
        .unwrap_or_default();

    let system = System::new_all();
    let is_running = system
        .processes_by_exact_name(process_name.as_ref())
        .next()
        .is_some();

    is_running
}

#[tauri::command]
#[specta::specta]
pub fn kill_process(path: String) {
    let process_name = Path::new(&path)
        .file_name()
        .and_then(|file_name| file_name.to_str())
        .unwrap_or_default();

    let system = System::new_all();
    for process in system.processes_by_exact_name(process_name.as_ref()) {
        process.kill();
    }
}

#[tauri::command]
#[specta::specta]
#[cfg(target_os = "windows")]
pub fn create_shortcut(
    app: AppHandle,
    target_path: String,
    shortcut_location: ShortcutLocation,
) -> Result<(), Error> {
    if let Ok(powershell_script_path) = app.path().resolve(
        "scripts/create_shortcut.ps1",
        tauri::path::BaseDirectory::Resource,
    ) {
        let shortcut_name = target_path
            .rsplit('\\')
            .next()
            .unwrap_or_default()
            .replace(".exe", ".lnk");
        let shortcut_location = match shortcut_location {
            ShortcutLocation::Desktop => "desktop",
            ShortcutLocation::Shell => "shell",
        };

        let output = Command::new("powershell")
            .args([
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                &powershell_script_path.display().to_string(),
                "-TargetPath",
                &target_path,
                "-ShortcutLocation",
                &shortcut_location,
                "-ShortcutName",
                &shortcut_name,
            ])
            .output();

        match output {
            Ok(output) if output.status.success() => {
                println!("Shortcut created successfully!");
            }
            Ok(output) => {
                eprintln!("Error: {}", String::from_utf8_lossy(&output.stderr));
            }
            Err(error) => {
                eprintln!("PowerShell execution failed: {}", error);
            }
        }

        Ok(())
    } else {
        Err(Error::IoError(std::io::ErrorKind::NotFound.into()))
    }
}
