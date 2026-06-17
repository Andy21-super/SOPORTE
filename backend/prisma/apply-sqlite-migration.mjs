import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.join(__dirname, "migrations", "20260611000000_init", "migration.sql");

function resolveSqlitePath() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("apply-sqlite-migration solo soporta DATABASE_URL con formato file: para SQLite.");
  }

  const rawPath = databaseUrl.slice("file:".length);
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(__dirname, rawPath);
}

function hasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info("${table}")`).all().some((row) => row.name === column);
}

function addColumn(db, table, column, definition) {
  if (!hasColumn(db, table, column)) {
    db.exec(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition};`);
  }
}

const dbPath = resolveSqlitePath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const needsBaseSchema = !fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0;
const db = new DatabaseSync(dbPath);

if (needsBaseSchema) {
  db.exec(fs.readFileSync(migrationPath, "utf8"));
  console.log(`SQLite creado: ${dbPath}`);
} else {
  console.log(`SQLite ya existe: ${dbPath}`);
}

try {
  addColumn(db, "roles", "deleted", "BOOLEAN NOT NULL DEFAULT false");
  addColumn(db, "roles", "createdAt", "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
  addColumn(db, "users", "deleted", "BOOLEAN NOT NULL DEFAULT false");
  addColumn(db, "users", "resetToken", "TEXT");
  addColumn(db, "users", "resetTokenExpiry", "DATETIME");
  addColumn(db, "modules", "deleted", "BOOLEAN NOT NULL DEFAULT false");
  addColumn(db, "ticket_categories", "deleted", "BOOLEAN NOT NULL DEFAULT false");
  addColumn(db, "ticket_priorities", "deleted", "BOOLEAN NOT NULL DEFAULT false");
  addColumn(db, "ticket_status", "deleted", "BOOLEAN NOT NULL DEFAULT false");
  addColumn(db, "audit_logs", "browser", "TEXT");
  addColumn(db, "audit_logs", "beforeData", "TEXT");
  addColumn(db, "audit_logs", "afterData", "TEXT");
  addColumn(db, "email_templates", "name", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "email_templates", "deleted", "BOOLEAN NOT NULL DEFAULT false");

  db.exec(`
    CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
    );
  `);
} finally {
  db.close();
}
