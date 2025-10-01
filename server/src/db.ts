import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || "./data/meals.db";

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(DB_PATH, { verbose: undefined });

db.pragma("foreign_keys = ON");

const schemaPath = path.resolve(__dirname, "./schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);
