import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma.js";
import { routeParam } from "../../helpers/params.js";
import { authenticate, requirePermission } from "../../middlewares/auth.js";
import { audit } from "../audit/audit.service.js";

export const moduleRoutes = Router();
moduleRoutes.use(authenticate);

const schema = z.object({ name: z.string().min(2), enabled: z.boolean().default(true) });

moduleRoutes.get("/", async (_req, res) => {
  res.json(await prisma.supportModule.findMany({ orderBy: { name: "asc" } }));
});

moduleRoutes.post("/", requirePermission("settings:manage"), async (req, res, next) => {
  try {
    const input = schema.parse(req.body);
    const module = await prisma.supportModule.create({ data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "CREATE", module: "modules", description: `Modulo ${module.name} creado` });
    res.status(201).json(module);
  } catch (error) {
    next(error);
  }
});

moduleRoutes.patch("/:id", requirePermission("settings:manage"), async (req, res, next) => {
  try {
    const input = schema.partial().parse(req.body);
    const module = await prisma.supportModule.update({ where: { id: routeParam(req.params.id) }, data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "modules", description: `Modulo ${module.name} actualizado` });
    res.json(module);
  } catch (error) {
    next(error);
  }
});
