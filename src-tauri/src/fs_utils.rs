use crate::Error;
use std::path::{Path, PathBuf};
use unrar::Archive;

#[tauri::command(async)]
#[specta::specta]
pub fn extract_archive(file_path: String, dest_path: Option<String>) -> Result<(), Error> {
    #[cfg(debug_assertions)]
    let start_time = std::time::Instant::now();
    let file_path = Path::new(&file_path);

    let dest_path: PathBuf = dest_path.map(PathBuf::from).unwrap_or_else(|| {
        let parent = file_path.parent().unwrap_or_else(|| Path::new("."));
        let stem = file_path.file_stem().unwrap_or_default();
        parent.join(stem)
    });

    println!(
        "Extracting {} to {}",
        file_path.display(),
        dest_path.display()
    );

    let mut archive = Archive::new(file_path).open_for_processing()?;

    while let Some(header) = archive.read_header()? {
        archive = if header.entry().is_file() {
            header.extract_with_base(&dest_path)?
        } else {
            header.skip()?
        };
    }

    #[cfg(debug_assertions)]
    println!("Extraction took {}ms", start_time.elapsed().as_millis());

    Ok(())
}
