import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../database/prisma.js";
import { routeParam } from "../../helpers/params.js";
import { authenticate, requirePermission } from "../../middlewares/auth.js";
import { audit } from "../audit/audit.service.js";

export const userRoutes = Router();
userRoutes.use(authenticate, requirePermission("users:manage"));

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  position: z.string().min(2),
  area: z.string().min(2),
  roleId: z.string().min(1),
  moduleIds: z.array(z.string()).default([])
});

const updateUserSchema = createUserSchema.omit({ password: true }).partial().extend({
  password: z.string().min(8).optional(),
  moduleIds: z.array(z.string()).optional(),
  active: z.boolean().optional()
});

const includeUser = { role: true, modules: { include: { module: true } } };

userRoutes.get("/", async (_req, res) => {
  res.json(await prisma.user.findMany({ include: includeUser, orderBy: { firstName: "asc" } }));
});

userRoutes.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: routeParam(req.params.id) }, include: includeUser });
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  return res.json(user);
});

userRoutes.post("/", async (req, res, next) => {
  try {
    const input = createUserSchema.parse(req.body);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 12),
        firstName: input.firstName,
        lastName: input.lastName,
        position: input.position,
        area: input.area,
        roleId: input.roleId,
        modules: { create: input.moduleIds.map((moduleId) => ({ moduleId })) }
      },
      include: includeUser
    });
    await audit({ userId: req.user!.id, ip: req.ip, action: "CREATE", module: "users", description: `Usuario ${user.email} creado` });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

userRoutes.patch("/:id", async (req, res, next) => {
  try {
    const id = routeParam(req.params.id);
    const input = updateUserSchema.parse(req.body);
    const { moduleIds, password, ...data } = input;
    const user = await prisma.$transaction(async (tx) => {
      if (moduleIds) {
        await tx.userModule.deleteMany({ where: { userId: id } });
        if (moduleIds.length) await tx.userModule.createMany({ data: moduleIds.map((moduleId) => ({ userId: id, moduleId })) });
      }
      return tx.user.update({
        where: { id },
        data: {
          ...data,
          passwordHash: password ? await bcrypt.hash(password, 12) : undefined
        },
        include: includeUser
      });
    });
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "users", description: `Usuario ${user.email} actualizado` });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

userRoutes.patch("/:id/toggle", async (req, res, next) => {
  try {
    const id = routeParam(req.params.id);
    const current = await prisma.user.findUniqueOrThrow({ where: { id } });
    const user = await prisma.user.update({ where: { id }, data: { active: !current.active }, include: includeUser });
    await audit({ userId: req.user!.id, ip: req.ip, action: "TOGGLE", module: "users", description: `Usuario ${user.email} ${user.active ? "habilitado" : "deshabilitado"}` });
    res.json(user);
  } catch (error) {
    next(error);
  }
});
