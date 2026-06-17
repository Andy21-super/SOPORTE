import { Router } from "express";
import { prisma } from "../../database/prisma.js";
import { routeParam } from "../../helpers/params.js";
import { authenticate } from "../../middlewares/auth.js";

export const notificationRoutes = Router();
notificationRoutes.use(authenticate);

notificationRoutes.get("/", async (req, res) => {
  res.json(await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" } }));
});

notificationRoutes.patch("/:id/read", async (req, res) => {
  res.json(await prisma.notification.update({ where: { id: routeParam(req.params.id) }, data: { read: true } }));
});
