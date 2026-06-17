import { Router } from "express";
import { prisma } from "../database/prisma.js";
import { authenticate, requirePermission } from "../middlewares/auth.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { catalogRoutes } from "../modules/catalogs/catalog.routes.js";
import { notificationRoutes } from "../modules/notifications/notification.routes.js";
import { moduleRoutes } from "../modules/modules/module.routes.js";
import { roleRoutes } from "../modules/roles/role.routes.js";
import { ticketRoutes } from "../modules/tickets/ticket.routes.js";
import { userRoutes } from "../modules/users/user.routes.js";
import { searchRoutes } from "../modules/search/search.routes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => res.json({ ok: true, service: "tickets-system-api" }));
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/tickets", ticketRoutes);
apiRoutes.use("/notifications", notificationRoutes);
apiRoutes.use("/modules", moduleRoutes);
apiRoutes.use("/roles", roleRoutes);
apiRoutes.use("/users", userRoutes);
apiRoutes.use("/admin/catalogs", catalogRoutes);
apiRoutes.use("/search", searchRoutes);

apiRoutes.get("/public/bootstrap", async (_req, res) => {
  const [areas, priorities, settings] = await Promise.all([
    prisma.area.findMany({ where: { enabled: true, deleted: false }, orderBy: { name: "asc" } }),
    prisma.ticketPriority.findMany({ where: { enabled: true, deleted: false }, orderBy: { slaHours: "asc" } }),
    prisma.systemSetting.findMany({ orderBy: { key: "asc" } })
  ]);
  res.json({ areas, priorities, settings });
});

apiRoutes.get("/catalogs", authenticate, async (_req, res) => {
  const [modules, areas, ticketTypes, categories, priorities, statuses, roles] = await Promise.all([
    prisma.supportModule.findMany({ where: { enabled: true }, orderBy: { name: "asc" } }),
    prisma.area.findMany({ where: { enabled: true, deleted: false }, orderBy: { name: "asc" } }),
    prisma.ticketType.findMany({ where: { enabled: true, deleted: false }, orderBy: { name: "asc" } }),
    prisma.ticketCategory.findMany({ where: { enabled: true }, orderBy: { name: "asc" } }),
    prisma.ticketPriority.findMany({ where: { enabled: true }, orderBy: { slaHours: "asc" } }),
    prisma.ticketStatus.findMany({ where: { enabled: true }, orderBy: { name: "asc" } }),
    prisma.role.findMany({ orderBy: { name: "asc" } })
  ]);
  res.json({ modules, areas, ticketTypes, categories, priorities, statuses, roles });
});

apiRoutes.get("/dashboard", authenticate, async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Parse date query parameters
  const startParam = req.query.startDate ? String(req.query.startDate) : undefined;
  const endParam = req.query.endDate ? String(req.query.endDate) : undefined;

  const dateFilter: Record<string, any> = {};
  if (startParam) {
    const d = new Date(startParam);
    d.setHours(0, 0, 0, 0);
    dateFilter.gte = d;
  }
  if (endParam) {
    const d = new Date(endParam);
    d.setHours(23, 59, 59, 999);
    dateFilter.lte = d;
  }

  const whereDate = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  // Parallel basic KPI counts
  const [
    total,
    open,
    closed,
    critical,
    reopened,
    overdue,
    usersActive,
    sessionsActive,
    tickets,
    resolvedTickets
  ] = await Promise.all([
    prisma.ticket.count({ where: { deleted: false, ...whereDate } }),
    prisma.ticket.count({ where: { deleted: false, ...whereDate, status: { name: { notIn: ["Cerrado", "Cancelado"] } } } }),
    prisma.ticket.count({ where: { deleted: false, ...whereDate, status: { name: "Cerrado" } } }),
    prisma.ticket.count({ where: { deleted: false, ...whereDate, priority: { name: "Critica" } } }),
    prisma.ticket.count({ where: { deleted: false, ...whereDate, reopenedCount: { gt: 0 } } }),
    prisma.ticket.count({ where: { deleted: false, ...whereDate, slaDueAt: { lt: now }, status: { name: { notIn: ["Cerrado", "Resuelto"] } } } }),
    prisma.user.count({ where: { deleted: false, active: true } }),
    prisma.session.count({ where: { revoked: false, expiresAt: { gt: now } } }),
    prisma.ticket.findMany({
      where: { deleted: false, ...whereDate },
      include: { status: true, priority: true, module: true, requester: true },
      orderBy: { createdAt: "desc" },
      take: 250
    }),
    prisma.ticket.findMany({
      where: { deleted: false, ...whereDate, resolvedAt: { not: null } },
      select: { resolvedAt: true, slaDueAt: true }
    })
  ]);

  // Trends calculation
  const [currentTotal, prevTotal, currentOpen, prevOpen, currentClosed, prevClosed, currentCritical, prevCritical] = await Promise.all([
    prisma.ticket.count({ where: { deleted: false, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.ticket.count({ where: { deleted: false, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.ticket.count({ where: { deleted: false, status: { name: { notIn: ["Cerrado", "Cancelado"] } }, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.ticket.count({ where: { deleted: false, status: { name: { notIn: ["Cerrado", "Cancelado"] } }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.ticket.count({ where: { deleted: false, status: { name: "Cerrado" }, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.ticket.count({ where: { deleted: false, status: { name: "Cerrado" }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.ticket.count({ where: { deleted: false, priority: { name: "Critica" }, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.ticket.count({ where: { deleted: false, priority: { name: "Critica" }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
  ]);

  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
  };

  const trends = {
    total: calcTrend(currentTotal, prevTotal),
    open: calcTrend(currentOpen, prevOpen),
    closed: calcTrend(currentClosed, prevClosed),
    critical: calcTrend(currentCritical, prevCritical)
  };

  // SLA calculations (Met SLA vs Broken SLA)
  let slaMet = 0;
  let slaBroken = 0;
  for (const t of resolvedTickets) {
    if (t.resolvedAt && t.slaDueAt) {
      if (new Date(t.resolvedAt) <= new Date(t.slaDueAt)) {
        slaMet += 1;
      } else {
        slaBroken += 1;
      }
    }
  }

  // Count metrics by key helper
  const countBy = (key: "status" | "priority" | "module" | "area") => {
    const map = new Map<string, { name: string; value: number; color?: string }>();
    for (const ticket of tickets) {
      const source = key === "area" ? { name: ticket.area } : ticket[key];
      const current = map.get(source.name) ?? { name: source.name, value: 0, color: "color" in source ? source.color : undefined };
      current.value += 1;
      map.set(source.name, current);
    }
    return [...map.values()].sort((a, b) => b.value - a.value);
  };

  // 12-Month Trends grouping
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
  const ticketsLastYear = await prisma.ticket.findMany({
    where: { deleted: false, createdAt: { gte: twelveMonthsAgo } },
    select: { createdAt: true, status: true }
  });

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthlyDataMap = new Map<string, { month: string; creados: number; resueltos: number }>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthlyDataMap.set(label, { month: label, creados: 0, resueltos: 0 });
  }

  for (const t of ticketsLastYear) {
    const date = new Date(t.createdAt);
    const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
    if (monthlyDataMap.has(label)) {
      const current = monthlyDataMap.get(label)!;
      current.creados += 1;
      if (t.status.name === "Cerrado" || t.status.name === "Resuelto") {
        current.resueltos += 1;
      }
    }
  }
  const monthlyTrend = [...monthlyDataMap.values()];

  const recentTickets = tickets.slice(0, 8).map((ticket) => ({
    id: ticket.id,
    number: ticket.number,
    subject: ticket.subject,
    status: ticket.status.name,
    statusColor: ticket.status.color,
    priority: ticket.priority.name,
    priorityColor: ticket.priority.color,
    module: ticket.module.name,
    requester: `${ticket.requester.firstName} ${ticket.requester.lastName}`,
    createdAt: ticket.createdAt
  }));

  res.json({
    kpis: { total, open, closed, critical, reopened, overdue, slaMet, slaBroken, usersActive, usersOnline: sessionsActive },
    trends,
    charts: {
      byStatus: countBy("status"),
      byPriority: countBy("priority"),
      byModule: countBy("module"),
      byArea: countBy("area"),
      monthlyTrend
    },
    recentTickets
  });
});

apiRoutes.get("/audit", authenticate, requirePermission("settings:manage"), async (_req, res) => {
  res.json(await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 200 }));
});

apiRoutes.get("/reports/tickets.csv", authenticate, requirePermission("reports:view"), async (_req, res) => {
  const tickets = await prisma.ticket.findMany({ include: { requester: true, module: true, priority: true, status: true, category: true } });
  const esc = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = ["numero,fecha,nombres,apellidos,dni,correo,area,cargo,modulo,categoria,prioridad,estado,asunto,descripcion"];
  for (const t of tickets) {
    const dni = t.position.startsWith("DNI ") ? t.position.replace("DNI ", "") : "";
    rows.push([
      t.number,
      t.createdAt.toISOString(),
      t.requester.firstName,
      t.requester.lastName,
      dni,
      t.requester.email,
      t.area,
      t.position.startsWith("DNI ") ? "Solicitante publico" : t.position,
      t.module.name,
      t.category.name,
      t.priority.name,
      t.status.name,
      t.subject,
      t.description
    ].map(esc).join(","));
  }
  res.header("Content-Type", "text/csv").send(rows.join("\n"));
});
