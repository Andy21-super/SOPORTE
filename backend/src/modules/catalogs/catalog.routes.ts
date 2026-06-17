import { Router } from "express";
import { z } from "zod";
import { upload } from "../../config/upload.js";
import { prisma } from "../../database/prisma.js";
import { routeParam } from "../../helpers/params.js";
import { authenticate, requirePermission } from "../../middlewares/auth.js";
import { audit } from "../audit/audit.service.js";

export const catalogRoutes = Router();
catalogRoutes.use(authenticate, requirePermission("settings:manage"));

const namedSchema = z.object({ name: z.string().min(2), enabled: z.boolean().default(true) });
const prioritySchema = namedSchema.extend({
  color: z.string().min(4).default("#2e7d32"),
  slaHours: z.coerce.number().int().positive().default(24)
});
const statusSchema = namedSchema.extend({ color: z.string().min(4).default("#1976d2") });
const templateSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(2),
  name: z.string().min(2),
  subject: z.string().min(3),
  html: z.string().min(10)
});

catalogRoutes.get("/", async (_req, res) => {
  const [modules, areas, ticketTypes, categories, priorities, statuses, settings, roles, templates, slaRules] = await Promise.all([
    prisma.supportModule.findMany({ orderBy: { name: "asc" } }),
    prisma.area.findMany({ where: { deleted: false }, orderBy: { name: "asc" } }),
    prisma.ticketType.findMany({ where: { deleted: false }, orderBy: { name: "asc" } }),
    prisma.ticketCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.ticketPriority.findMany({ orderBy: { slaHours: "asc" } }),
    prisma.ticketStatus.findMany({ orderBy: { name: "asc" } }),
    prisma.systemSetting.findMany({ orderBy: { key: "asc" } }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
    prisma.emailTemplate.findMany({ where: { deleted: false }, orderBy: { key: "asc" } }),
    prisma.slaRule.findMany({ include: { priority: true }, orderBy: { hours: "asc" } })
  ]);
  res.json({ modules, areas, ticketTypes, categories, priorities, statuses, settings, roles, templates, slaRules });
});

catalogRoutes.post("/areas", async (req, res, next) => {
  try {
    const input = namedSchema.parse(req.body);
    const area = await prisma.area.create({ data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "CREATE", module: "areas", description: `Area ${area.name} creada` });
    res.status(201).json(area);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.patch("/areas/:id", async (req, res, next) => {
  try {
    const input = namedSchema.partial().parse(req.body);
    const area = await prisma.area.update({ where: { id: routeParam(req.params.id) }, data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "areas", description: `Area ${area.name} actualizada` });
    res.json(area);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.delete("/areas/:id", async (req, res, next) => {
  try {
    const area = await prisma.area.update({ where: { id: routeParam(req.params.id) }, data: { deleted: true, enabled: false } });
    await audit({ userId: req.user!.id, ip: req.ip, action: "DELETE", module: "areas", description: `Area ${area.name} eliminada` });
    res.json(area);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.post("/ticket-types", async (req, res, next) => {
  try {
    const input = namedSchema.parse(req.body);
    const type = await prisma.ticketType.create({ data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "CREATE", module: "ticket-types", description: `Tipo ${type.name} creado` });
    res.status(201).json(type);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.patch("/ticket-types/:id", async (req, res, next) => {
  try {
    const input = namedSchema.partial().parse(req.body);
    const type = await prisma.ticketType.update({ where: { id: routeParam(req.params.id) }, data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "ticket-types", description: `Tipo ${type.name} actualizado` });
    res.json(type);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.post("/categories", async (req, res, next) => {
  try {
    const input = namedSchema.parse(req.body);
    const category = await prisma.ticketCategory.create({ data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "CREATE", module: "categories", description: `Categoria ${category.name} creada` });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.patch("/categories/:id", async (req, res, next) => {
  try {
    const input = namedSchema.partial().parse(req.body);
    const category = await prisma.ticketCategory.update({ where: { id: routeParam(req.params.id) }, data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "categories", description: `Categoria ${category.name} actualizada` });
    res.json(category);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.post("/priorities", async (req, res, next) => {
  try {
    const input = prioritySchema.parse(req.body);
    const priority = await prisma.ticketPriority.create({ data: input });
    await prisma.slaRule.create({ data: { priorityId: priority.id, hours: priority.slaHours } });
    await audit({ userId: req.user!.id, ip: req.ip, action: "CREATE", module: "priorities", description: `Prioridad ${priority.name} creada` });
    res.status(201).json(priority);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.patch("/priorities/:id", async (req, res, next) => {
  try {
    const input = prioritySchema.partial().parse(req.body);
    const priority = await prisma.ticketPriority.update({ where: { id: routeParam(req.params.id) }, data: input });
    if (input.slaHours) {
      await prisma.slaRule.upsert({
        where: { id: priority.id },
        update: { hours: input.slaHours },
        create: { id: priority.id, priorityId: priority.id, hours: input.slaHours }
      });
    }
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "priorities", description: `Prioridad ${priority.name} actualizada` });
    res.json(priority);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.put("/sla-rules", async (req, res, next) => {
  try {
    const rules = z.array(z.object({
      priorityId: z.string().min(1),
      hours: z.coerce.number().int().positive(),
      warn75: z.boolean().default(true),
      warn90: z.boolean().default(true),
      warn100: z.boolean().default(true)
    })).parse(req.body);
    const result = await Promise.all(rules.map((rule) => prisma.slaRule.upsert({
      where: { id: rule.priorityId },
      update: rule,
      create: { id: rule.priorityId, ...rule }
    })));
    await Promise.all(rules.map((rule) => prisma.ticketPriority.update({ where: { id: rule.priorityId }, data: { slaHours: rule.hours } })));
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "sla", description: "Reglas SLA actualizadas" });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.post("/statuses", async (req, res, next) => {
  try {
    const input = statusSchema.parse(req.body);
    const status = await prisma.ticketStatus.create({ data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "CREATE", module: "statuses", description: `Estado ${status.name} creado` });
    res.status(201).json(status);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.patch("/statuses/:id", async (req, res, next) => {
  try {
    const input = statusSchema.partial().parse(req.body);
    const status = await prisma.ticketStatus.update({ where: { id: routeParam(req.params.id) }, data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "statuses", description: `Estado ${status.name} actualizado` });
    res.json(status);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.put("/settings", async (req, res, next) => {
  try {
    const entries = z.record(z.string().min(1)).parse(req.body);
    const result = await Promise.all(Object.entries(entries).map(([key, value]) => prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })));
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "settings", description: "Parametros del sistema actualizados" });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.post("/settings/logo", upload.single("logo"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Archivo de logo requerido" });
    const logoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const setting = await prisma.systemSetting.upsert({
      where: { key: "logo_url" },
      update: { value: logoUrl },
      create: { key: "logo_url", value: logoUrl }
    });
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPLOAD", module: "settings", description: "Logo corporativo actualizado" });
    res.status(201).json(setting);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.put("/email-templates/:id", async (req, res, next) => {
  try {
    const input = templateSchema.omit({ id: true }).partial().parse(req.body);
    const template = await prisma.emailTemplate.update({
      where: { id: routeParam(req.params.id) },
      data: input
    });
    await audit({ userId: req.user!.id, ip: req.ip, action: "UPDATE", module: "email-templates", description: `Plantilla ${template.key} actualizada` });
    res.json(template);
  } catch (error) {
    next(error);
  }
});

catalogRoutes.post("/email-templates", async (req, res, next) => {
  try {
    const input = templateSchema.parse(req.body);
    const template = await prisma.emailTemplate.create({ data: input });
    await audit({ userId: req.user!.id, ip: req.ip, action: "CREATE", module: "email-templates", description: `Plantilla ${template.key} creada` });
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});
