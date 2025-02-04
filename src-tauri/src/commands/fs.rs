use crate::Error;

#[tauri::command]
#[specta::specta]
pub fn delete_file(path: String) -> Result<(), Error> {
    std::fs::remove_file(path).map_err(Error::IoError)?;
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn exists(path: String) -> Result<(), Error> {
    std::fs::metadata(path).map_err(Error::IoError)?;
    Ok(())
}
