import { Router } from "express";
import { prisma } from "../../database/prisma.js";
import { upload } from "../../config/upload.js";
import { routeParam } from "../../helpers/params.js";
import { authenticate, requirePermission } from "../../middlewares/auth.js";
import { addComment, createPublicTicket, createTicket, ticketInclude, updateTicket } from "./ticket.service.js";
import { commentSchema, createTicketSchema, publicTicketSchema, updateTicketSchema } from "./ticket.validators.js";

export const ticketRoutes = Router();

ticketRoutes.get("/public/by-ip", async (req, res) => {
  const tickets = await prisma.ticket.findMany({
    where: { deleted: false, requesterIp: req.ip },
    include: {
      ...ticketInclude,
      comments: {
        where: { internal: false },
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 25
  });
  res.json(tickets);
});

ticketRoutes.post("/public", async (req, res, next) => {
  try {
    res.status(201).json(await createPublicTicket(publicTicketSchema.parse(req.body), req.ip));
  } catch (error) {
    next(error);
  }
});

ticketRoutes.get("/public/:id", async (req, res) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id: routeParam(req.params.id), deleted: false, requesterIp: req.ip },
    include: {
      ...ticketInclude,
      comments: {
        where: { internal: false },
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });
  if (!ticket) return res.status(404).json({ message: "Ticket no encontrado para este equipo" });
  return res.json(ticket);
});

ticketRoutes.post("/public/:id/comments", async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: { id: routeParam(req.params.id), deleted: false, requesterIp: req.ip },
      select: { id: true, requesterId: true }
    });
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado para este equipo" });
    const input = commentSchema.parse(req.body);
    res.status(201).json(await addComment(ticket.id, ticket.requesterId, input.message, false, input.noSolucionado, req.ip));
  } catch (error) {
    next(error);
  }
});

ticketRoutes.use(authenticate);

ticketRoutes.get("/", async (req, res) => {
  const tickets = await prisma.ticket.findMany({ include: ticketInclude, orderBy: { createdAt: "desc" } });
  res.json(tickets);
});

ticketRoutes.post("/", requirePermission("tickets:create"), async (req, res, next) => {
  try {
    res.status(201).json(await createTicket(req.user!.id, createTicketSchema.parse(req.body), req.ip));
  } catch (error) {
    next(error);
  }
});

ticketRoutes.get("/:id", async (req, res) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: routeParam(req.params.id) }, include: ticketInclude });
  if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
  return res.json(ticket);
});

ticketRoutes.patch("/:id", requirePermission("tickets:manage"), async (req, res, next) => {
  try {
    res.json(await updateTicket(routeParam(req.params.id), updateTicketSchema.parse(req.body), req.user!.id, req.ip));
  } catch (error) {
    next(error);
  }
});

ticketRoutes.post("/:id/comments", async (req, res, next) => {
  try {
    const input = commentSchema.parse(req.body);
    res.status(201).json(await addComment(routeParam(req.params.id), req.user!.id, input.message, input.internal, input.noSolucionado, req.ip));
  } catch (error) {
    next(error);
  }
});

ticketRoutes.post("/:id/attachments", upload.array("files", 5), async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const attachments = await Promise.all(files.map((file) => prisma.ticketAttachment.create({
      data: {
        ticketId: routeParam(req.params.id),
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`
      }
    })));
    res.status(201).json(attachments);
  } catch (error) {
    next(error);
  }
});
