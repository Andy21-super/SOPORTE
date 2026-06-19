import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(rootDir, "data");
const uploadDir = path.join(rootDir, "uploads");
const backupDir = path.join(rootDir, "backups");

for (const directory of [dataDir, uploadDir, backupDir]) {
  fs.mkdirSync(directory, { recursive: true });
}

process.env.NODE_ENV ??= "production";
process.env.PORT ??= "3000";
process.env.DATABASE_URL ??= `file:${path.join(dataDir, "soporte.db").replaceAll("\\", "/")}`;
process.env.FRONTEND_DIST_DIR ??= path.join(rootDir, "frontend", "dist");
process.env.UPLOAD_DIR ??= uploadDir;
process.env.BACKUP_DIR ??= backupDir;

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("Configure JWT_SECRET y JWT_REFRESH_SECRET en las variables de entorno de cPanel.");
}

await import("./backend/dist/server.js");
