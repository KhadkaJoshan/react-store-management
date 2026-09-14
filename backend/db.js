const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "inventory.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err.message);
  } else {
    console.log("Connected to embedded SQLite database:", dbPath);
  }
});

// Create tables if they do not exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT,
      Email TEXT UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT,
      Price REAL,
      Quantity INTEGER,
      user_id TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      SalesID INTEGER PRIMARY KEY AUTOINCREMENT,
      SName TEXT,
      SPrice REAL,
      SQuantity INTEGER,
      user_id TEXT,
      DOS TEXT,
      Stotal REAL
    )
  `);
});

module.exports = db;
