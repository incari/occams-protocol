import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "occam.db");

// Ensure data directory exists
import fs from "fs";
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma("journal_mode = WAL");

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    variant TEXT NOT NULL,
    exercises TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS measurements (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    weight REAL NOT NULL,
    body_fat REAL NOT NULL,
    measurements TEXT NOT NULL,
    measurement_unit TEXT NOT NULL,
    weight_unit TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    unit TEXT NOT NULL DEFAULT 'kg',
    notifications TEXT NOT NULL DEFAULT '{}',
    measurement_notifications TEXT NOT NULL DEFAULT '{}',
    theme TEXT NOT NULL DEFAULT 'light'
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT,
    height REAL,
    initial_weight REAL,
    height_unit TEXT,
    weight_unit TEXT,
    onboarding_completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS scheduled_reminders (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    variant TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    completed INTEGER DEFAULT 0
  );

  -- Insert default settings if not exists
  INSERT OR IGNORE INTO settings (id, unit, notifications, measurement_notifications, theme)
  VALUES (1, 'kg', '{"enabled":false,"days":["monday","wednesday","friday"],"time":"18:00"}', 
          '{"enabled":false,"day":"monday","time":"18:00"}', 'light');
`);

export default db;

