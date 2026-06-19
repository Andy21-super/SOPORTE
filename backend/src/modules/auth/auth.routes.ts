import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../database/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../helpers/tokens.js";
import { audit } from "../audit/audit.service.js";

export const authRoutes = Router();

const loginSchema = z.object({ email: z.string().min(1), password: z.string().min(6) });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });

const userInclude = {
  role: { include: { permissions: { include: { permission: true } } } },
  modules: { include: { module: true } }
} as const;

function sessionUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roleId: user.roleId,
    area: user.area,
    position: user.position,
    role: user.role.name,
    permissions: user.role.permissions.map((item: any) => item.permission.key)
  };
}

authRoutes.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: userInclude
    });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ message: "Credenciales invalidas" });

    const authUser = sessionUser(user);
    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(user.id);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    await audit({ userId: user.id, ip: req.ip, action: "LOGIN", module: "auth", description: "Inicio de sesion correcto" });
    res.json({ accessToken, refreshToken, user: { ...authUser, modules: user.modules.map((item) => item.module) } });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const userId = verifyRefreshToken(refreshToken);
    const session = await prisma.session.findFirst({
      where: { userId, refreshToken, revoked: false, expiresAt: { gt: new Date() } }
    });
    if (!session) return res.status(401).json({ message: "Sesion vencida" });
    const user = await prisma.user.findFirst({ where: { id: userId, active: true, deleted: false }, include: userInclude });
    if (!user) return res.status(401).json({ message: "Usuario no disponible" });
    res.json({ accessToken: signAccessToken(sessionUser(user)) });
  } catch (error) {
    if (error instanceof Error && (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")) {
      return res.status(401).json({ message: "Sesion vencida" });
    }
    next(error);
  }
});
