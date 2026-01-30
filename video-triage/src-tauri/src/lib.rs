mod db;

use db::{Clip, Database, Project, Tag};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;
use tauri::{Manager, State};
use walkdir::WalkDir;

const VIDEO_EXTENSIONS: &[&str] = &[
    "mp4", "mov", "avi", "mkv", "mts", "m2ts", "wmv", "flv", "webm", "m4v", "mpg", "mpeg", "3gp",
    "mxf", "r3d", "braw", "ari",
];

fn is_video_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| VIDEO_EXTENSIONS.contains(&ext.to_lowercase().as_str()))
        .unwrap_or(false)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanResult {
    pub clips: Vec<Clip>,
    pub total_found: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClipWithTags {
    #[serde(flatten)]
    pub clip: Clip,
    pub tags: Vec<Tag>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportResult {
    pub exported: usize,
    pub failed: usize,
    pub destination: String,
}

// -- Project Commands --

#[tauri::command]
fn create_project(db: State<Database>, name: String, root_path: String) -> Result<Project, String> {
    db.create_project(&name, &root_path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_projects(db: State<Database>) -> Result<Vec<Project>, String> {
    db.get_projects().map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_project(db: State<Database>, project_id: i64) -> Result<(), String> {
    db.delete_project(project_id).map_err(|e| e.to_string())
}

// -- Scan & Import Commands --

#[tauri::command]
fn scan_folder(
    db: State<Database>,
    project_id: i64,
    folder_path: String,
) -> Result<ScanResult, String> {
    let mut clips = Vec::new();
    let mut total_found = 0;

    for entry in WalkDir::new(&folder_path)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.is_file() && is_video_file(path) {
            total_found += 1;
            let file_path = path.to_string_lossy().to_string();
            let file_name = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            let file_size = std::fs::metadata(path).map(|m| m.len() as i64).unwrap_or(0);

            match db.add_clip(project_id, &file_path, &file_name, file_size) {
                Ok(clip) => clips.push(clip),
                Err(e) => eprintln!("Failed to add clip {}: {}", file_path, e),
            }
        }
    }

    Ok(ScanResult { clips, total_found })
}

// -- Clip Commands --

#[tauri::command]
fn get_clips(db: State<Database>, project_id: i64) -> Result<Vec<Clip>, String> {
    db.get_clips(project_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_clips_with_tags(db: State<Database>, project_id: i64) -> Result<Vec<ClipWithTags>, String> {
    let clips = db.get_clips(project_id).map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for clip in clips {
        let tags = db.get_clip_tags(clip.id).unwrap_or_default();
        result.push(ClipWithTags { clip, tags });
    }
    Ok(result)
}

#[tauri::command]
fn update_clip_rating(db: State<Database>, clip_id: i64, rating: i32) -> Result<(), String> {
    db.update_clip_rating(clip_id, rating)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_clip_status(db: State<Database>, clip_id: i64, status: String) -> Result<(), String> {
    db.update_clip_status(clip_id, &status)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_clip_notes(db: State<Database>, clip_id: i64, notes: String) -> Result<(), String> {
    db.update_clip_notes(clip_id, &notes)
        .map_err(|e| e.to_string())
}

// -- Thumbnail Commands --

const SPRITE_FRAME_COUNT: usize = 12;
const SPRITE_FRAME_WIDTH: u32 = 320;

/// Get video duration via ffprobe
fn probe_duration(file_path: &str) -> Result<f64, String> {
    let result = Command::new("ffprobe")
        .args([
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            file_path,
        ])
        .output()
        .map_err(|e| format!("ffprobe failed: {}", e))?;

    if !result.status.success() {
        return Err("ffprobe failed".to_string());
    }

    let output = String::from_utf8_lossy(&result.stdout);
    let json: serde_json::Value =
        serde_json::from_str(&output).map_err(|e| format!("Failed to parse ffprobe: {}", e))?;

    let duration = json["format"]["duration"]
        .as_str()
        .and_then(|d| d.parse::<f64>().ok())
        .unwrap_or(0.0);

    Ok(duration)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ThumbnailResult {
    pub thumbnail_path: String,
    pub sprite_path: String,
    pub duration_secs: f64,
    pub frame_count: usize,
}

#[tauri::command]
fn generate_thumbnail(
    db: State<Database>,
    clip_id: i64,
    file_path: String,
    output_dir: String,
) -> Result<ThumbnailResult, String> {
    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;

    // Get duration first
    let duration = probe_duration(&file_path)?;

    // 1. Generate single cover thumbnail (frame at 10% of duration)
    let cover_name = format!("thumb_{}.jpg", clip_id);
    let cover_path = Path::new(&output_dir).join(&cover_name);
    let cover_str = cover_path.to_string_lossy().to_string();
    let cover_time = if duration > 1.0 {
        format!("{:.2}", duration * 0.1)
    } else {
        "0".to_string()
    };

    let result = Command::new("ffmpeg")
        .args([
            "-y",
            "-i",
            &file_path,
            "-ss",
            &cover_time,
            "-vframes",
            "1",
            "-vf",
            &format!("scale={}:-1", SPRITE_FRAME_WIDTH),
            "-q:v",
            "5",
            &cover_str,
        ])
        .output()
        .map_err(|e| format!("ffmpeg failed: {}", e))?;

    if !result.status.success() {
        // Fallback to 0s
        Command::new("ffmpeg")
            .args([
                "-y",
                "-i",
                &file_path,
                "-ss",
                "0",
                "-vframes",
                "1",
                "-vf",
                &format!("scale={}:-1", SPRITE_FRAME_WIDTH),
                "-q:v",
                "5",
                &cover_str,
            ])
            .output()
            .map_err(|e| format!("ffmpeg cover fallback failed: {}", e))?;
    }

    // 2. Generate sprite strip - N frames spread evenly across duration, stitched horizontally
    let sprite_name = format!("sprite_{}.jpg", clip_id);
    let sprite_path = Path::new(&output_dir).join(&sprite_name);
    let sprite_str = sprite_path.to_string_lossy().to_string();

    let frame_count = if duration < 2.0 {
        1
    } else {
        SPRITE_FRAME_COUNT
    };

    if frame_count == 1 {
        // Very short clip: just copy cover as sprite
        std::fs::copy(&cover_str, &sprite_str).map_err(|e| e.to_string())?;
    } else {
        // Build ffmpeg filter: select frames at evenly spaced timestamps, tile them horizontally
        // Using fps filter + select to pick exact frames
        let interval = duration / frame_count as f64;
        let mut select_parts = Vec::new();
        for i in 0..frame_count {
            let t = interval * i as f64 + interval * 0.5; // middle of each segment
            select_parts.push(format!("gte(t\\,{:.3})*lt(t\\,{:.3})", t, t + 0.1));
        }

        // Simpler approach: use -vf with select+tile
        let select_expr = select_parts.join("+");
        let filter = format!(
            "select='{}',scale={}:-1,tile={}x1",
            select_expr, SPRITE_FRAME_WIDTH, frame_count
        );

        let result = Command::new("ffmpeg")
            .args([
                "-y",
                "-i",
                &file_path,
                "-vf",
                &filter,
                "-frames:v",
                "1",
                "-q:v",
                "6",
                &sprite_str,
            ])
            .output()
            .map_err(|e| format!("ffmpeg sprite failed: {}", e))?;

        if !result.status.success() {
            let stderr = String::from_utf8_lossy(&result.stderr);
            // Fallback: just use the cover as sprite
            eprintln!("Sprite generation failed, using cover: {}", stderr);
            std::fs::copy(&cover_str, &sprite_str).map_err(|e| e.to_string())?;
        }
    }

    // Update DB with cover thumbnail, duration, and sprite info
    db.update_clip_thumbnail(clip_id, &cover_str)
        .map_err(|e| e.to_string())?;
    db.update_clip_metadata(clip_id, duration, 0, 0)
        .map_err(|e| e.to_string())?;
    db.update_clip_sprite(clip_id, &sprite_str, frame_count as i32)
        .map_err(|e| e.to_string())?;

    Ok(ThumbnailResult {
        thumbnail_path: cover_str,
        sprite_path: sprite_str,
        duration_secs: duration,
        frame_count,
    })
}

#[tauri::command]
fn get_video_metadata(file_path: String) -> Result<(f64, i32, i32), String> {
    let result = Command::new("ffprobe")
        .args([
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            &file_path,
        ])
        .output()
        .map_err(|e| format!("Failed to run ffprobe: {}", e))?;

    if !result.status.success() {
        return Err("ffprobe failed".to_string());
    }

    let output = String::from_utf8_lossy(&result.stdout);
    let json: serde_json::Value = serde_json::from_str(&output)
        .map_err(|e| format!("Failed to parse ffprobe output: {}", e))?;

    let duration = json["format"]["duration"]
        .as_str()
        .and_then(|d| d.parse::<f64>().ok())
        .unwrap_or(0.0);

    let (width, height) = json["streams"]
        .as_array()
        .and_then(|streams| {
            streams
                .iter()
                .find(|s| s["codec_type"] == "video")
                .map(|s| {
                    (
                        s["width"].as_i64().unwrap_or(0) as i32,
                        s["height"].as_i64().unwrap_or(0) as i32,
                    )
                })
        })
        .unwrap_or((0, 0));

    Ok((duration, width, height))
}

// -- Tag Commands --

#[tauri::command]
fn create_tag(db: State<Database>, name: String, color: String) -> Result<Tag, String> {
    db.create_tag(&name, &color).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_tags(db: State<Database>) -> Result<Vec<Tag>, String> {
    db.get_tags().map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_tag(db: State<Database>, tag_id: i64) -> Result<(), String> {
    db.delete_tag(tag_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_clip_tag(db: State<Database>, clip_id: i64, tag_id: i64) -> Result<(), String> {
    db.add_clip_tag(clip_id, tag_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_clip_tag(db: State<Database>, clip_id: i64, tag_id: i64) -> Result<(), String> {
    db.remove_clip_tag(clip_id, tag_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_clip_tags(db: State<Database>, clip_id: i64) -> Result<Vec<Tag>, String> {
    db.get_clip_tags(clip_id).map_err(|e| e.to_string())
}

// -- Export Commands --

#[tauri::command]
fn export_kept_clips(
    db: State<Database>,
    project_id: i64,
    destination: String,
) -> Result<ExportResult, String> {
    std::fs::create_dir_all(&destination).map_err(|e| e.to_string())?;

    let clips = db
        .get_clips_by_status(project_id, "kept")
        .map_err(|e| e.to_string())?;

    let mut exported = 0;
    let mut failed = 0;

    for clip in &clips {
        let src = Path::new(&clip.file_path);
        let dst = Path::new(&destination).join(&clip.file_name);

        match std::fs::copy(src, &dst) {
            Ok(_) => exported += 1,
            Err(e) => {
                eprintln!("Failed to copy {}: {}", clip.file_name, e);
                failed += 1;
            }
        }
    }

    Ok(ExportResult {
        exported,
        failed,
        destination,
    })
}

#[tauri::command]
fn get_thumbnail_dir(app: tauri::AppHandle) -> Result<String, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let thumb_dir = data_dir.join("thumbnails");
    std::fs::create_dir_all(&thumb_dir).map_err(|e| e.to_string())?;
    Ok(thumb_dir.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");
            let db = Database::new(data_dir).expect("Failed to initialize database");
            app.manage(db);

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_project,
            get_projects,
            delete_project,
            scan_folder,
            get_clips,
            get_clips_with_tags,
            update_clip_rating,
            update_clip_status,
            update_clip_notes,
            generate_thumbnail,
            get_video_metadata,
            create_tag,
            get_tags,
            delete_tag,
            add_clip_tag,
            remove_clip_tag,
            get_clip_tags,
            export_kept_clips,
            get_thumbnail_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
