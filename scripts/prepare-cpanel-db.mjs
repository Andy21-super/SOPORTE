import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const [source, destination] = process.argv.slice(2);
if (!source || !destination) throw new Error("Uso: node prepare-cpanel-db.mjs <origen> <destino>");

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);

const db = new DatabaseSync(destination);
try {
  db.exec("PRAGMA journal_mode=DELETE; PRAGMA wal_checkpoint(TRUNCATE);");
  db.prepare("UPDATE system_settings SET value = ? WHERE key = 'logo_url'").run("/campamentos-dioses-logo-current.jpeg");
  const integrity = db.prepare("PRAGMA integrity_check").get();
  if (integrity.integrity_check !== "ok") throw new Error(`SQLite no supero integrity_check: ${integrity.integrity_check}`);
} finally {
  db.close();
}
