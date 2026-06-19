import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "./env.js";

export const uploadDir = path.resolve(env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"));
fs.mkdirSync(uploadDir, { recursive: true });

const allowed = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed"
]);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, allowed.has(file.mimetype));
  }
});

export const logoUpload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.toLowerCase().startsWith("image/")) {
      cb(new Error("El archivo seleccionado no es una imagen valida"));
      return;
    }
    cb(null, true);
  }
});
