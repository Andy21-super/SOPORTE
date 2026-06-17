import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

export async function sendMail(to: string, subject: string, html: string) {
  if (!env.SMTP_HOST) return { skipped: true };
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
  });
  return transport.sendMail({ from: env.MAIL_FROM, to, subject, html });
}

export function ticketTemplate(title: string, body: string) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:24px">
      <div style="max-width:680px;margin:auto;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:24px">
        <h2 style="color:#12355b;margin-top:0">${title}</h2>
        <p style="color:#334155;line-height:1.6">${body}</p>
      </div>
    </div>`;
}
