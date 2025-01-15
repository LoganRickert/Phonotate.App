const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { app } = require('electron');

// Determine the database file path
const isDev = !app.isPackaged;
const basePath = isDev ? __dirname : app.getPath('userData');

// Database file path
const dbPath = path.join(basePath, 'data', 'projects.db');

// Ensure database directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Create projects table with author_id and uuid
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    voice_actor TEXT NOT NULL,
    emotion TEXT,
    description TEXT,
    author_id TEXT,
    storage_type TEXT DEFAULT 'Local', -- 'Local' or 'Cloud'
    storage_path TEXT, -- For 'Local' storage
    s3_url TEXT, -- For 'Cloud' storage
    s3_bucket TEXT,
    s3_root_folder TEXT,
    s3_key TEXT,
    date_created TEXT NOT NULL -- ISO format date
  )
`);

// Create samples table with rating, size in bytes, and file path
db.exec(`
  CREATE TABLE IF NOT EXISTS samples (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,  -- Link sample to a project
    rating INTEGER,  -- Rating 0 (bad) or 1 (good)
    file_path TEXT NOT NULL,  -- Path to WAV file
    file_path24 TEXT NOT NULL,
    length_seconds INTEGER NOT NULL,  -- Length of the recording in seconds
    size_bytes INTEGER NOT NULL,  -- Size of the WAV file in bytes
    text_said TEXT NOT NULL,  -- Transcription result
    ground_truth TEXT NOT NULL,  -- The original prompt text
    date_recorded TEXT NOT NULL,  -- ISO 8601 date format
    waveform_path TEXT NOT NULL,  -- Path to waveform image
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )
`);

// Create settings table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

module.exports = db;
