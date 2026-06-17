import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../database/prisma.js";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Token requerido" });
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: { include: { permissions: { include: { permission: true } } } } }
    });
    if (!user || !user.active) return res.status(401).json({ message: "Usuario no autorizado" });
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      area: user.area,
      position: user.position,
      role: user.role.name,
      permissions: user.role.permissions.map((item) => item.permission.key)
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Token invalido" });
  }
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.permissions.includes(permission)) return res.status(403).json({ message: "Permiso insuficiente" });
    return next();
  };
}
