use crate::{ExecutableFinishedEvent, ExecutableStartedEvent};
use std::{process::Command, time::Instant};
use tauri::AppHandle;
use tauri_specta::Event;

#[tauri::command]
#[specta::specta]
pub fn run_executable(app: AppHandle, path: String) -> Result<(), String> {
    let mut command = Command::new(&path);

    let start_time = Instant::now();
    std::thread::spawn(move || {
        if let Ok(mut child) = command.spawn() {
            ExecutableStartedEvent {
                path: path.to_string(),
            }
            .emit(&app)
            .ok();

            child.wait().expect("command wasn't running");

            ExecutableFinishedEvent {
                path,
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
