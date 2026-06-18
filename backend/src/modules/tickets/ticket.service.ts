import { prisma } from "../../database/prisma.js";
import { randomUUID } from "crypto";
import { getIo } from "../../sockets/io.js";
import { audit } from "../audit/audit.service.js";
import { notify } from "../notifications/notification.service.js";

async function ticketNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.ticket.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  });
  return `TKT-${year}-${String(count + 1).padStart(6, "0")}`;
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export async function createTicket(userId: string, input: { moduleId: string; categoryId: string; typeId?: string; priorityId: string; subject: string; description: string }, ip?: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const priority = await prisma.ticketPriority.findUniqueOrThrow({ where: { id: input.priorityId } });
  const status = await prisma.ticketStatus.findUniqueOrThrow({ where: { name: "Nuevo" } });
  const ticket = await prisma.ticket.create({
    data: {
      number: await ticketNumber(),
      requesterId: user.id,
      requesterIp: ip,
      area: user.area,
      position: user.position,
      moduleId: input.moduleId,
      categoryId: input.categoryId,
      typeId: input.typeId,
      priorityId: input.priorityId,
      statusId: status.id,
      subject: input.subject,
      description: input.description,
      slaDueAt: new Date(Date.now() + priority.slaHours * 60 * 60 * 1000)
    },
    include: ticketInclude
  });
  await audit({ userId, ip, action: "CREATE", module: "tickets", description: `Ticket ${ticket.number} creado` });
  getIo()?.emit("ticket:created", ticket);
  return ticket;
}

export async function getLocalPublicTickets(ip?: string) {
  return await prisma.ticket.findMany({
    where: ip ? { requesterIp: ip } : {},
    include: ticketInclude,
    orderBy: { createdAt: "desc" }
  });
}

export async function createPublicTicket(input: {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  area: string;
  description: string;
  priorityId?: string;
}, ip?: string, deviceId?: string) {
  const publicRole = await prisma.role.findUniqueOrThrow({ where: { name: "Usuario Final" } });
  const requester = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      area: input.area,
      position: `DNI ${input.dni}`,
      active: true
    },
    create: {
      email: input.email,
      passwordHash: `public-${randomUUID()}`,
      firstName: input.firstName,
      lastName: input.lastName,
      area: input.area,
      position: `DNI ${input.dni}`,
      roleId: publicRole.id
    }
  });

  const [module, category, priority, status] = await Promise.all([
    prisma.supportModule.findFirstOrThrow({ where: { enabled: true, deleted: false }, orderBy: { name: "asc" } }),
    prisma.ticketCategory.findFirstOrThrow({ where: { enabled: true, deleted: false }, orderBy: { name: "asc" } }),
    input.priorityId
      ? prisma.ticketPriority.findUniqueOrThrow({ where: { id: input.priorityId } })
      : prisma.ticketPriority.findFirstOrThrow({ where: { enabled: true, deleted: false, name: "Media" } }),
    prisma.ticketStatus.findUniqueOrThrow({ where: { name: "Nuevo" } })
  ]);

  const ticket = await prisma.ticket.create({
    data: {
      number: await ticketNumber(),
      requesterId: requester.id,
      requesterIp: ip,
      area: input.area,
      position: requester.position,
      moduleId: module.id,
      categoryId: category.id,
      priorityId: priority.id,
      statusId: status.id,
      subject: `Solicitud TI de ${input.firstName} ${input.lastName}`,
      description: input.description,
      slaDueAt: new Date(Date.now() + priority.slaHours * 60 * 60 * 1000)
    },
    include: ticketInclude
  });

  await audit({ userId: requester.id, ip, action: "CREATE_PUBLIC", module: "tickets", description: `Ticket publico ${ticket.number} creado` });
  getIo()?.emit("ticket:created", ticket);
  return ticket;
}

export async function addComment(ticketId: string, userId: string, message: string, internal = false, noSolucionado = false, ip?: string) {
  const comment = await prisma.ticketComment.create({ data: { ticketId, userId, message, internal }, include: { user: true } });
  const shouldReopen = noSolucionado || normalizeText(message).includes("intente la solucion propuesta y el problema continua");
  if (shouldReopen) {
    const status = await prisma.ticketStatus.findUniqueOrThrow({ where: { name: "Reabierto" } });
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { statusId: status.id, reopenedCount: { increment: 1 } },
      include: ticketInclude
    });
    await audit({ userId, ip, action: "REOPEN", module: "tickets", description: `Ticket ${ticket.number} reabierto automaticamente` });
    getIo()?.emit("ticket:updated", ticket);
  }
  getIo()?.to(`ticket:${ticketId}`).emit("comment:new", comment);
  return comment;
}

export async function updateTicket(ticketId: string, input: { statusId?: string; assigneeId?: string; priorityId?: string }, userId: string, ip?: string) {
  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { statusId: input.statusId, priorityId: input.priorityId },
    include: ticketInclude
  });
  if (input.assigneeId) {
    await prisma.ticketAssignment.create({ data: { ticketId, assigneeId: input.assigneeId } });
    await notify(input.assigneeId, "Ticket asignado", `Se te asigno el ticket ${ticket.number}`, "ticket", "high");
  }
  await audit({ userId, ip, action: "UPDATE", module: "tickets", description: `Ticket ${ticket.number} actualizado` });
  getIo()?.emit("ticket:updated", ticket);
  return ticket;
}

export const ticketInclude = {
  requester: true,
  module: true,
  category: true,
  type: true,
  priority: true,
  status: true,
  comments: { include: { user: true }, orderBy: { createdAt: "asc" as const } },
  assignments: { include: { assignee: true }, orderBy: { createdAt: "desc" as const } }
};
