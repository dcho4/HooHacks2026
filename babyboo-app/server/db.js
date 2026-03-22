const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'babyboo.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    auth0_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    parent_name TEXT DEFAULT '',
    onboarding_complete INTEGER DEFAULT 0,
    dark_mode INTEGER DEFAULT 0,
    theme TEXT DEFAULT 'lavender',
    notifications INTEGER DEFAULT 1,
    developer_mode INTEGER DEFAULT 0,
    family_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS baby_profiles (
    auth0_id TEXT PRIMARY KEY,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    date_of_birth TEXT DEFAULT '',
    sex TEXT DEFAULT '',
    state TEXT DEFAULT '',
    has_medical_conditions INTEGER DEFAULT 0,
    medical_conditions TEXT DEFAULT '[]',
    family_history TEXT DEFAULT '[]',
    family_history_other TEXT DEFAULT '',
    FOREIGN KEY (auth0_id) REFERENCES users(auth0_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS feed_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auth0_id TEXT NOT NULL,
    type TEXT,
    amount TEXT,
    note TEXT,
    timestamp TEXT,
    FOREIGN KEY (auth0_id) REFERENCES users(auth0_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sleep_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auth0_id TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    note TEXT,
    timestamp TEXT,
    FOREIGN KEY (auth0_id) REFERENCES users(auth0_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auth0_id TEXT NOT NULL,
    text TEXT,
    date TEXT,
    FOREIGN KEY (auth0_id) REFERENCES users(auth0_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS growth_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auth0_id TEXT NOT NULL,
    weight TEXT,
    height TEXT,
    head_circumference TEXT,
    date TEXT,
    FOREIGN KEY (auth0_id) REFERENCES users(auth0_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auth0_id TEXT NOT NULL,
    name TEXT,
    role TEXT,
    initials TEXT,
    FOREIGN KEY (auth0_id) REFERENCES users(auth0_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auth0_id TEXT NOT NULL,
    data_url TEXT,
    date TEXT,
    FOREIGN KEY (auth0_id) REFERENCES users(auth0_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS vaccine_status (
    auth0_id TEXT NOT NULL,
    vaccine_id INTEGER NOT NULL,
    done INTEGER DEFAULT 1,
    PRIMARY KEY (auth0_id, vaccine_id),
    FOREIGN KEY (auth0_id) REFERENCES users(auth0_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS routine_checks (
    auth0_id TEXT NOT NULL,
    date TEXT NOT NULL,
    tasks TEXT DEFAULT '{}',
    PRIMARY KEY (auth0_id, date),
    FOREIGN KEY (auth0_id) REFERENCES users(auth0_id) ON DELETE CASCADE
  );
`);

module.exports = db;
