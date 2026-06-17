import { prisma } from "../../database/prisma.js";
import { notify } from "../notifications/notification.service.js";

export async function scanSlaBreaches() {
  const now = new Date();
  const tickets = await prisma.ticket.findMany({
    where: {
      slaDueAt: { not: null },
      status: { name: { notIn: ["Cerrado", "Resuelto", "Cancelado"] } }
    },
    include: { requester: true, status: true, priority: true }
  });

  for (const ticket of tickets) {
    if (!ticket.slaDueAt) continue;
    const createdAt = ticket.createdAt.getTime();
    const dueAt = ticket.slaDueAt.getTime();
    const percent = Math.min(100, Math.floor(((now.getTime() - createdAt) / (dueAt - createdAt)) * 100));
    const thresholds = [75, 90, 100].filter((threshold) => percent >= threshold);

    for (const threshold of thresholds) {
      const existing = await prisma.slaEvent.findFirst({ where: { ticketId: ticket.id, percent: threshold } });
      if (existing) continue;
      await prisma.slaEvent.create({ data: { ticketId: ticket.id, event: threshold === 100 ? "SLA_VENCIDO" : "SLA_ALERTA", percent: threshold } });
      await notify(ticket.requesterId, threshold === 100 ? "SLA vencido" : "SLA proximo a vencer", `Ticket ${ticket.number}: ${threshold}% del SLA`, "sla", threshold === 100 ? "critical" : "high");
    }
  }
}

export function startSlaJob() {
  setInterval(() => {
    scanSlaBreaches().catch((error) => console.error("SLA job error", error));
  }, 5 * 60 * 1000);
}
