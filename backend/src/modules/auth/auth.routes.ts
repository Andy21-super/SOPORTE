import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../database/prisma.js";
import { signAccessToken, signRefreshToken } from "../../helpers/tokens.js";
import { audit } from "../audit/audit.service.js";

export const authRoutes = Router();

const loginSchema = z.object({ email: z.string().min(1), password: z.string().min(6) });

authRoutes.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { role: { include: { permissions: { include: { permission: true } } } }, modules: { include: { module: true } } }
    });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ message: "Credenciales invalidas" });

    const authUser = {
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
