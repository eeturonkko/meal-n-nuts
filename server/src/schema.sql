PRAGMA foreign_keys = ON;

/* Cached products from barcode scans (FatSecret result) */
CREATE TABLE IF NOT EXISTS barcode_cache (
  upc TEXT PRIMARY KEY,
  product_name TEXT,
  nutrients_json TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

/* Recipes (from FatSecret or manual in future) */
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  source TEXT CHECK(source IN ('fatsecret','manual')) NOT NULL,
  title TEXT NOT NULL,
  nutrients_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

/* User favorites */
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, recipe_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

/* A meal log per day */
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,             
  label TEXT,                     
  created_at TEXT DEFAULT (datetime('now'))
);

/* Items inside a meal */
CREATE TABLE IF NOT EXISTS meal_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_id INTEGER NOT NULL,
  source TEXT CHECK(source IN ('recipe','barcode')) NOT NULL,
  ref_id TEXT,                    
  qty REAL DEFAULT 1,             
  unit TEXT,                      
  kcal REAL, protein REAL, carbs REAL, fat REAL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_meals_user_date ON meals(user_id, date);
CREATE INDEX IF NOT EXISTS ix_meal_items_meal_id ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS ix_favorites_user ON favorites(user_id);
