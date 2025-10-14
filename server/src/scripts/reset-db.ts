import Database from "better-sqlite3";
import "dotenv/config";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || "./data/meals.db";

const candidates = [
  path.resolve(__dirname, "../schema.sql"),
  path.resolve(process.cwd(), "src/schema.sql"),
  path.resolve(process.cwd(), "schema.sql"),
];

let schemaPath: string | null = null;
for (const p of candidates) {
  if (fs.existsSync(p)) {
    schemaPath = p;
    break;
  }
}
if (!schemaPath) {
  throw new Error("schema.sql not found");
}

await fsp.mkdir(path.dirname(DB_PATH), { recursive: true });
if (fs.existsSync(DB_PATH)) {
  await fsp.rm(DB_PATH);
}

const schema = await fsp.readFile(schemaPath, "utf8");
const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");
db.exec(schema);
db.close();

console.log(`DB reset: ${path.resolve(DB_PATH)}\nSchema: ${schemaPath}`);
