import { prisma } from "../../database/prisma.js";
import { getIo } from "../../sockets/io.js";

export async function notify(userId: string, title: string, message: string, type = "info", priority = "normal") {
  const notification = await prisma.notification.create({ data: { userId, title, message, type, priority } });
  getIo()?.to(`user:${userId}`).emit("notification:new", notification);
  return notification;
}
