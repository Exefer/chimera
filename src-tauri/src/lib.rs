use serde::{Deserialize, Serialize};
use specta::Type;
use tauri_specta::Event;

#[derive(Serialize, Deserialize, Debug, Clone, Type, Event)]
pub struct ExecutableStarted {
    path: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, Type, Event)]
pub struct ExecutableFinished {
    path: String,
    execution_time: u32,
}

#[tauri::command]
#[specta::specta]
fn run_executable(app: tauri::AppHandle, path: String) {
    let mut command = std::process::Command::new(&path);

    let timestamp = std::time::Instant::now();
    std::thread::spawn(move || {
        if let Ok(mut child) = command.spawn() {
            ExecutableStarted::emit(
                &ExecutableStarted {
                    path: path.to_owned(),
                },
                &app,
            )
            .unwrap();

            child.wait().expect("command wasn't running");

            let execution_time = timestamp.elapsed().as_secs() as u32;

            ExecutableFinished::emit(
                &ExecutableFinished {
                    path,
                    execution_time,
                },
                &app,
            )
            .unwrap();
        } else {
            eprintln!("command didn't start");
        }
    });
}

pub fn run() {
    let builder = tauri_specta::Builder::<tauri::Wry>::new()
        .commands(tauri_specta::collect_commands![run_executable])
        .events(tauri_specta::collect_events![
            ExecutableStarted,
            ExecutableFinished
        ]);

    #[cfg(debug_assertions)]
    builder
        .export(
            specta_typescript::Typescript::default().header("// @ts-nocheck"),
            "../src/lib/specta-bindings.ts",
        )
        .expect("Failed to export typescript bindings");

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            builder.mount_events(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
