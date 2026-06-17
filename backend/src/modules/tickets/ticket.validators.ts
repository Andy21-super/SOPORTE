import { z } from "zod";

export const createTicketSchema = z.object({
  moduleId: z.string().min(1),
  categoryId: z.string().min(1),
  typeId: z.string().min(1).optional(),
  priorityId: z.string().min(1),
  subject: z.string().min(5).max(160),
  description: z.string().min(10)
});

export const publicTicketSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  dni: z.string().regex(/^\d{8,12}$/, "El DNI debe contener solo numeros"),
  email: z.string().email(),
  area: z.string().min(1),
  description: z.string().min(20),
  priorityId: z.string().optional()
});

export const commentSchema = z.object({
  message: z.string().min(2),
  internal: z.boolean().default(false),
  noSolucionado: z.boolean().default(false)
});

export const updateTicketSchema = z.object({
  statusId: z.string().optional(),
  assigneeId: z.string().optional(),
  priorityId: z.string().optional()
});
