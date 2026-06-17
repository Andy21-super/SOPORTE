import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string().min(16).default("replace-with-a-long-random-secret"),
  JWT_REFRESH_SECRET: z.string().min(16).default("replace-with-another-long-random-secret"),
  ACCESS_TOKEN_MINUTES: z.coerce.number().default(30),
  REFRESH_TOKEN_DAYS: z.coerce.number().default(7),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default("Soporte <soporte@empresa.com>"),
  MAX_UPLOAD_MB: z.coerce.number().default(10),
  UPLOAD_DIR: z.string().optional(),
  FRONTEND_DIST_DIR: z.string().optional()
});

export const env = schema.parse(process.env);
