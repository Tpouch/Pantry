const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'pantry.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.prepare(`CREATE TABLE IF NOT EXISTS ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  expiration_date TEXT,
  category TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`).run()

db.prepare(`CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  steps TEXT NOT NULL DEFAULT '[]',
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`).run()

db.prepare(`CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL
)`).run()

db.prepare(`CREATE TABLE IF NOT EXISTS cook_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cooked_at TEXT NOT NULL
)`).run()

db.prepare(`CREATE TABLE IF NOT EXISTS meal_plan (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT    NOT NULL,
  day        INTEGER NOT NULL,
  meal_type  TEXT    NOT NULL,
  recipe_id  INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE(week_start, day, meal_type)
)`).run()

module.exports = db
