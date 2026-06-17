import { prisma } from "../../database/prisma.js";

export interface AuditInput {
  userId?: string;
  ip?: string;
  browser?: string;
  action: string;
  module: string;
  description: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
}

export function audit(input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId,
      ip: input.ip,
      browser: input.browser,
      action: input.action,
      module: input.module,
      description: input.description,
      beforeData: input.beforeData ? JSON.stringify(input.beforeData) : null,
      afterData: input.afterData ? JSON.stringify(input.afterData) : null
    }
  });
}

/** Extract browser name from User-Agent string */
export function parseBrowser(userAgent?: string): string {
  if (!userAgent) return "Desconocido";
  if (userAgent.includes("Edg/")) return "Edge";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Firefox/")) return "Firefox";
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome")) return "Safari";
  if (userAgent.includes("Opera") || userAgent.includes("OPR/")) return "Opera";
  return "Otro";
}
