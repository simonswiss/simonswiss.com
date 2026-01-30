use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: i64,
    pub name: String,
    pub root_path: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Clip {
    pub id: i64,
    pub project_id: i64,
    pub file_path: String,
    pub file_name: String,
    pub file_size: i64,
    pub duration_secs: Option<f64>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub rating: i32,
    pub status: String, // "unreviewed", "kept", "rejected"
    pub notes: String,
    pub thumbnail_path: Option<String>,
    pub sprite_path: Option<String>,
    pub sprite_frames: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClipTag {
    pub clip_id: i64,
    pub tag_id: i64,
}

impl Database {
    pub fn new(app_data_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&app_data_dir).ok();
        let db_path = app_data_dir.join("video_triage.db");
        let conn = Connection::open(db_path)?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                root_path TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS clips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                file_path TEXT NOT NULL UNIQUE,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL DEFAULT 0,
                duration_secs REAL,
                width INTEGER,
                height INTEGER,
                rating INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'unreviewed',
                notes TEXT NOT NULL DEFAULT '',
                thumbnail_path TEXT,
                sprite_path TEXT,
                sprite_frames INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                color TEXT NOT NULL DEFAULT '#6366f1'
            );

            CREATE TABLE IF NOT EXISTS clip_tags (
                clip_id INTEGER NOT NULL,
                tag_id INTEGER NOT NULL,
                PRIMARY KEY (clip_id, tag_id),
                FOREIGN KEY (clip_id) REFERENCES clips(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_clips_project ON clips(project_id);
            CREATE INDEX IF NOT EXISTS idx_clips_status ON clips(status);
            CREATE INDEX IF NOT EXISTS idx_clips_rating ON clips(rating);
            CREATE INDEX IF NOT EXISTS idx_clip_tags_clip ON clip_tags(clip_id);
            CREATE INDEX IF NOT EXISTS idx_clip_tags_tag ON clip_tags(tag_id);
            ",
        )?;

        // Migration: add sprite columns if missing (for existing databases)
        let has_sprite: bool = conn
            .prepare("SELECT sprite_path FROM clips LIMIT 0")
            .is_ok();
        if !has_sprite {
            conn.execute_batch(
                "ALTER TABLE clips ADD COLUMN sprite_path TEXT;
                 ALTER TABLE clips ADD COLUMN sprite_frames INTEGER NOT NULL DEFAULT 0;",
            )?;
        }

        Ok(())
    }

    // -- Project operations --

    pub fn create_project(&self, name: &str, root_path: &str) -> Result<Project> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO projects (name, root_path) VALUES (?1, ?2)",
            params![name, root_path],
        )?;
        let id = conn.last_insert_rowid();
        let project = conn.query_row(
            "SELECT id, name, root_path, created_at FROM projects WHERE id = ?1",
            params![id],
            |row| {
                Ok(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    root_path: row.get(2)?,
                    created_at: row.get(3)?,
                })
            },
        )?;
        Ok(project)
    }

    pub fn get_projects(&self) -> Result<Vec<Project>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, root_path, created_at FROM projects ORDER BY created_at DESC",
        )?;
        let projects = stmt
            .query_map([], |row| {
                Ok(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    root_path: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;
        Ok(projects)
    }

    pub fn delete_project(&self, project_id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM projects WHERE id = ?1", params![project_id])?;
        Ok(())
    }

    // -- Clip operations --

    pub fn add_clip(
        &self,
        project_id: i64,
        file_path: &str,
        file_name: &str,
        file_size: i64,
    ) -> Result<Clip> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO clips (project_id, file_path, file_name, file_size) VALUES (?1, ?2, ?3, ?4)",
            params![project_id, file_path, file_name, file_size],
        )?;
        let clip = conn.query_row(
            "SELECT id, project_id, file_path, file_name, file_size, duration_secs, width, height, rating, status, notes, thumbnail_path, sprite_path, sprite_frames, created_at FROM clips WHERE file_path = ?1",
            params![file_path],
            |row| {
                Ok(Clip {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    file_path: row.get(2)?,
                    file_name: row.get(3)?,
                    file_size: row.get(4)?,
                    duration_secs: row.get(5)?,
                    width: row.get(6)?,
                    height: row.get(7)?,
                    rating: row.get(8)?,
                    status: row.get(9)?,
                    notes: row.get(10)?,
                    thumbnail_path: row.get(11)?,
                    sprite_path: row.get(12)?,
                    sprite_frames: row.get(13)?,
                    created_at: row.get(14)?,
                })
            },
        )?;
        Ok(clip)
    }

    pub fn get_clips(&self, project_id: i64) -> Result<Vec<Clip>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, project_id, file_path, file_name, file_size, duration_secs, width, height, rating, status, notes, thumbnail_path, sprite_path, sprite_frames, created_at FROM clips WHERE project_id = ?1 ORDER BY file_name ASC",
        )?;
        let clips = stmt
            .query_map(params![project_id], |row| {
                Ok(Clip {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    file_path: row.get(2)?,
                    file_name: row.get(3)?,
                    file_size: row.get(4)?,
                    duration_secs: row.get(5)?,
                    width: row.get(6)?,
                    height: row.get(7)?,
                    rating: row.get(8)?,
                    status: row.get(9)?,
                    notes: row.get(10)?,
                    thumbnail_path: row.get(11)?,
                    sprite_path: row.get(12)?,
                    sprite_frames: row.get(13)?,
                    created_at: row.get(14)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;
        Ok(clips)
    }

    pub fn update_clip_rating(&self, clip_id: i64, rating: i32) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE clips SET rating = ?1 WHERE id = ?2",
            params![rating, clip_id],
        )?;
        Ok(())
    }

    pub fn update_clip_status(&self, clip_id: i64, status: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE clips SET status = ?1 WHERE id = ?2",
            params![status, clip_id],
        )?;
        Ok(())
    }

    pub fn update_clip_notes(&self, clip_id: i64, notes: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE clips SET notes = ?1 WHERE id = ?2",
            params![notes, clip_id],
        )?;
        Ok(())
    }

    pub fn update_clip_thumbnail(&self, clip_id: i64, thumbnail_path: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE clips SET thumbnail_path = ?1 WHERE id = ?2",
            params![thumbnail_path, clip_id],
        )?;
        Ok(())
    }

    pub fn update_clip_metadata(
        &self,
        clip_id: i64,
        duration: f64,
        width: i32,
        height: i32,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE clips SET duration_secs = ?1, width = ?2, height = ?3 WHERE id = ?4",
            params![duration, width, height, clip_id],
        )?;
        Ok(())
    }

    // -- Tag operations --

    pub fn create_tag(&self, name: &str, color: &str) -> Result<Tag> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO tags (name, color) VALUES (?1, ?2)",
            params![name, color],
        )?;
        let id = conn.last_insert_rowid();
        Ok(Tag {
            id,
            name: name.to_string(),
            color: color.to_string(),
        })
    }

    pub fn get_tags(&self) -> Result<Vec<Tag>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, name, color FROM tags ORDER BY name ASC")?;
        let tags = stmt
            .query_map([], |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;
        Ok(tags)
    }

    pub fn delete_tag(&self, tag_id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM tags WHERE id = ?1", params![tag_id])?;
        Ok(())
    }

    pub fn add_clip_tag(&self, clip_id: i64, tag_id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO clip_tags (clip_id, tag_id) VALUES (?1, ?2)",
            params![clip_id, tag_id],
        )?;
        Ok(())
    }

    pub fn remove_clip_tag(&self, clip_id: i64, tag_id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "DELETE FROM clip_tags WHERE clip_id = ?1 AND tag_id = ?2",
            params![clip_id, tag_id],
        )?;
        Ok(())
    }

    pub fn get_clip_tags(&self, clip_id: i64) -> Result<Vec<Tag>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT t.id, t.name, t.color FROM tags t INNER JOIN clip_tags ct ON t.id = ct.tag_id WHERE ct.clip_id = ?1 ORDER BY t.name ASC",
        )?;
        let tags = stmt
            .query_map(params![clip_id], |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;
        Ok(tags)
    }

    pub fn get_clips_by_status(&self, project_id: i64, status: &str) -> Result<Vec<Clip>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, project_id, file_path, file_name, file_size, duration_secs, width, height, rating, status, notes, thumbnail_path, sprite_path, sprite_frames, created_at FROM clips WHERE project_id = ?1 AND status = ?2 ORDER BY file_name ASC",
        )?;
        let clips = stmt
            .query_map(params![project_id, status], |row| {
                Ok(Clip {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    file_path: row.get(2)?,
                    file_name: row.get(3)?,
                    file_size: row.get(4)?,
                    duration_secs: row.get(5)?,
                    width: row.get(6)?,
                    height: row.get(7)?,
                    rating: row.get(8)?,
                    status: row.get(9)?,
                    notes: row.get(10)?,
                    thumbnail_path: row.get(11)?,
                    sprite_path: row.get(12)?,
                    sprite_frames: row.get(13)?,
                    created_at: row.get(14)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;
        Ok(clips)
    }

    pub fn update_clip_sprite(
        &self,
        clip_id: i64,
        sprite_path: &str,
        sprite_frames: i32,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE clips SET sprite_path = ?1, sprite_frames = ?2 WHERE id = ?3",
            params![sprite_path, sprite_frames, clip_id],
        )?;
        Ok(())
    }
}
