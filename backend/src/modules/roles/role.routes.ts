import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma.js";
import { routeParam } from "../../helpers/params.js";
import { authenticate, requirePermission } from "../../middlewares/auth.js";

export const roleRoutes = Router();
roleRoutes.use(authenticate, requirePermission("roles:manage"));

roleRoutes.get("/", async (_req, res) => {
  res.json(await prisma.role.findMany({ include: { permissions: { include: { permission: true } }, users: true }, orderBy: { name: "asc" } }));
});

roleRoutes.get("/permissions", async (_req, res) => {
  res.json(await prisma.permission.findMany({ orderBy: { key: "asc" } }));
});

const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([])
});

roleRoutes.post("/", async (req, res, next) => {
  try {
    const input = roleSchema.parse(req.body);
    const role = await prisma.role.create({
      data: {
        name: input.name,
        description: input.description,
        permissions: { create: input.permissionIds.map((permissionId) => ({ permissionId })) }
      },
      include: { permissions: { include: { permission: true } }, users: true }
    });
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
});

roleRoutes.patch("/:id", async (req, res, next) => {
  try {
    const id = routeParam(req.params.id);
    const input = roleSchema.partial().parse(req.body);
    const role = await prisma.$transaction(async (tx) => {
      if (input.permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (input.permissionIds.length) await tx.rolePermission.createMany({ data: input.permissionIds.map((permissionId) => ({ roleId: id, permissionId })) });
      }
      return tx.role.update({
        where: { id },
        data: { name: input.name, description: input.description },
        include: { permissions: { include: { permission: true } }, users: true }
      });
    });
    res.json(role);
  } catch (error) {
    next(error);
  }
});
