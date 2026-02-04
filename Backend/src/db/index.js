import Database from "better-sqlite3";
import { DATABASE_URL } from "../config/config.js";

const db = new Database(DATABASE_URL);

// Create tables if not exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    title TEXT,
    createdAt TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chatId TEXT,
    role TEXT,
    content TEXT,
    createdAt TEXT
  )
`).run();

export default db;
