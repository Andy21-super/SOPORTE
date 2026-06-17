import { Router } from "express";
import { prisma } from "../../database/prisma.js";
import { authenticate } from "../../middlewares/auth.js";

export const searchRoutes = Router();
searchRoutes.use(authenticate);

searchRoutes.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  if (q.length < 2) return res.json({ tickets: [], users: [], modules: [], categories: [], settings: [] });

  const [tickets, users, modules, categories, settings] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        deleted: false,
        OR: [
          { number: { contains: q } },
          { subject: { contains: q } }
        ]
      },
      include: { status: true, priority: true, module: true },
      take: 8,
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findMany({
      where: {
        deleted: false,
        OR: [
          { email: { contains: q } },
          { firstName: { contains: q } },
          { lastName: { contains: q } }
        ]
      },
      include: { role: true },
      take: 5,
      orderBy: { firstName: "asc" }
    }),
    prisma.supportModule.findMany({
      where: { deleted: false, name: { contains: q } },
      take: 5,
      orderBy: { name: "asc" }
    }),
    prisma.ticketCategory.findMany({
      where: { deleted: false, name: { contains: q } },
      take: 5,
      orderBy: { name: "asc" }
    }),
    prisma.systemSetting.findMany({
      where: { key: { contains: q } },
      take: 5,
      orderBy: { key: "asc" }
    })
  ]);

  return res.json({ tickets, users, modules, categories, settings });
});
