import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Recurso no encontrado" });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) return res.status(422).json({ message: "Validacion fallida", errors: error.flatten() });
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "La imagen supera el tamano maximo permitido" : error.message;
    return res.status(413).json({ message });
  }
  if (error instanceof Error && error.message === "El archivo seleccionado no es una imagen valida") {
    return res.status(415).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Error interno del servidor" });
}
