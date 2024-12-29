// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri::GlobalShortcutManager;

#[tauri::command]
async fn check_update(app_handle: tauri::AppHandle) -> Result<String, String> {
    match app_handle.updater().check().await {
        Ok(update) => {
            if update.is_available() {
                Ok("Update available".to_string())
            } else {
                Ok("No updates available".to_string())
            }
        }
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            
            // Register global shortcut with proper error handling
            let handle = app.handle();
            let mut shortcut_manager = handle.global_shortcut_manager();
            
            // Unregister existing shortcut if it exists
            if shortcut_manager.is_registered("Alt+Space").unwrap_or(false) {
                let _ = shortcut_manager.unregister("Alt+Space");
            }
            
            if let Err(e) = shortcut_manager.register("Alt+Space", move || {
                if let Some(window) = handle.get_window("main") {
                    let _ = if window.is_visible().unwrap_or(false) {
                        window.hide()
                    } else {
                        window.show().and_then(|_| window.set_focus())
                    };
                }
            }) {
                eprintln!("Failed to register shortcut: {}", e);
            }
            
            // Check for updates on startup
            #[cfg(not(debug_assertions))]
            {
                let app_handle = handle.clone();
                tauri::async_runtime::spawn(async move {
                    if let Ok(update) = app_handle.updater().check().await {
                        if update.is_available() {
                            println!("Update available: {}", update.latest_version());
                        }
                    }
                });
            }
            
            // Set security headers
            window.eval("
                window.eval = undefined;
                window.Function = undefined;
                Object.freeze(window.localStorage);
                Object.freeze(window.sessionStorage);
            ").expect("Failed to set security headers");
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![check_update])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
