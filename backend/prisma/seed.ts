import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roles = ["Administrador General", "Jefe de Area", "Soporte TI", "Usuario Final"];
const permissions = [
  ["dashboard:view", "Ver dashboard"],
  ["tickets:create", "Crear tickets"],
  ["tickets:manage", "Gestionar tickets"],
  ["users:manage", "Gestionar usuarios"],
  ["roles:manage", "Gestionar roles"],
  ["modules:manage", "Gestionar modulos"],
  ["categories:manage", "Gestionar categorias"],
  ["priorities:manage", "Gestionar prioridades"],
  ["statuses:manage", "Gestionar estados"],
  ["templates:manage", "Gestionar plantillas de correo"],
  ["reports:view", "Ver reportes"],
  ["audit:view", "Ver auditoria"],
  ["settings:manage", "Administrar configuracion"],
  ["sla:manage", "Gestionar reglas SLA"]
];
const modules = ["ERP", "Recursos Humanos", "Logistica", "Produccion", "Finanzas", "Compras", "Transporte", "Campamentos", "Sistemas", "Comercial", "Contabilidad"];
const areas = ["Sistemas", "Recursos Humanos", "Logistica", "Produccion", "Finanzas", "Compras", "Transporte", "Campamentos", "Comercial", "Contabilidad", "Operaciones"];
const ticketTypes = ["Solicitud", "Incidencia", "Problema", "Cambio", "Consulta", "Mantenimiento", "Acceso"];
const categories = ["Error de Sistema", "Acceso", "Configuracion", "Consulta", "Mejora", "Incidente", "Incidente Critico", "Integracion", "Reporte"];
const statuses = [
  ["Nuevo", "#1976d2"],
  ["Asignado", "#7b1fa2"],
  ["En Proceso", "#0288d1"],
  ["Pendiente Usuario", "#fbc02d"],
  ["Resuelto", "#2e7d32"],
  ["Cerrado", "#616161"],
  ["Reabierto", "#8b0000"],
  ["Cancelado", "#455a64"]
];
const priorities = [
  ["Baja", "#2e7d32", 72],
  ["Media", "#fbc02d", 24],
  ["Alta", "#ef6c00", 8],
  ["Critica", "#c62828", 4]
] as const;

const defaultSettings: [string, string][] = [
  ["company_name", "CAMPAMENTOS DIOSES"],
  ["max_upload_mb", "10"],
  ["logo_url", "/campamentos-dioses-logo.jpg"],
  ["favicon_url", ""],
  ["report_logo_url", ""],
  ["login_image_url", ""],
  ["theme_primary", "#0f172a"],
  ["theme_secondary", "#6366f1"],
  ["public_title", "Panel publico de soporte TI"],
  ["public_subtitle", "Mesa de ayuda para operaciones, construccion y montaje metalico"],
  ["public_description", "Registre incidencias, solicitudes de acceso, equipos, sistemas o conectividad. Sus tickets creados desde este computador aparecen aqui automaticamente."],
  ["public_background_url", "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=80"],
  ["allowed_domain", "empresa.com"],
  ["max_failed_logins", "5"],
  ["smtp_host", ""],
  ["smtp_port", "587"],
  ["smtp_user", ""],
  ["mail_from", "Soporte <soporte@empresa.com>"],
  ["report_signature_url", ""]
];

const emailTemplates: { key: string; name: string; subject: string; html: string }[] = [
  {
    key: "ticket_created",
    name: "Ticket creado",
    subject: "Ticket {{number}} creado",
    html: "<h2>Se ha creado el ticket {{number}}</h2><p>Asunto: {{subject}}</p><p>Prioridad: {{priority}}</p>"
  },
  {
    key: "ticket_assigned",
    name: "Ticket asignado",
    subject: "Se te ha asignado el ticket {{number}}",
    html: "<h2>Ticket {{number}} asignado</h2><p>Asunto: {{subject}}</p><p>Revisa el panel para mas detalles.</p>"
  },
  {
    key: "ticket_resolved",
    name: "Ticket resuelto",
    subject: "Ticket {{number}} resuelto",
    html: "<h2>Ticket {{number}} resuelto</h2><p>Tu incidencia ha sido marcada como resuelta.</p>"
  },
  {
    key: "password_reset",
    name: "Recuperar contrasena",
    subject: "Recuperacion de contrasena",
    html: "<h2>Recuperar contrasena</h2><p>Usa el siguiente enlace para restablecer tu contrasena:</p><p><a href='{{resetUrl}}'>Restablecer contrasena</a></p><p>Este enlace expira en 1 hora.</p>"
  },
  {
    key: "sla_warning",
    name: "Alerta SLA",
    subject: "Alerta SLA - Ticket {{number}} al {{percent}}%",
    html: "<h2>Alerta SLA</h2><p>El ticket {{number}} ha alcanzado el {{percent}}% de su tiempo SLA.</p>"
  }
];

async function main() {
  for (const name of roles) await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  for (const [key, label] of permissions) await prisma.permission.upsert({ where: { key }, update: { label }, create: { key, label } });

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "Administrador General" } });
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id }
    });
  }

  // Assign basic permissions to other roles
  const soporteRole = await prisma.role.findUnique({ where: { name: "Soporte TI" } });
  if (soporteRole) {
    const soportePerms = ["dashboard:view", "tickets:create", "tickets:manage", "reports:view", "audit:view"];
    for (const key of soportePerms) {
      const perm = await prisma.permission.findUnique({ where: { key } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: soporteRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: soporteRole.id, permissionId: perm.id }
        });
      }
    }
  }

  const jefeRole = await prisma.role.findUnique({ where: { name: "Jefe de Area" } });
  if (jefeRole) {
    const jefePerms = ["dashboard:view", "tickets:create", "tickets:manage", "reports:view"];
    for (const key of jefePerms) {
      const perm = await prisma.permission.findUnique({ where: { key } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: jefeRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: jefeRole.id, permissionId: perm.id }
        });
      }
    }
  }

  const userRole = await prisma.role.findUnique({ where: { name: "Usuario Final" } });
  if (userRole) {
    const userPerms = ["dashboard:view", "tickets:create"];
    for (const key of userPerms) {
      const perm = await prisma.permission.findUnique({ where: { key } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: userRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: userRole.id, permissionId: perm.id }
        });
      }
    }
  }

  for (const name of modules) await prisma.supportModule.upsert({ where: { name }, update: {}, create: { name } });
  for (const name of areas) await prisma.area.upsert({ where: { name }, update: {}, create: { name } });
  for (const name of ticketTypes) await prisma.ticketType.upsert({ where: { name }, update: {}, create: { name } });
  for (const name of categories) await prisma.ticketCategory.upsert({ where: { name }, update: {}, create: { name } });
  for (const [name, color] of statuses) await prisma.ticketStatus.upsert({ where: { name }, update: { color }, create: { name, color } });
  for (const [name, color, slaHours] of priorities) {
    const priority = await prisma.ticketPriority.upsert({ where: { name }, update: { color, slaHours }, create: { name, color, slaHours } });
    await prisma.slaRule.upsert({ where: { id: priority.id }, update: { hours: slaHours }, create: { id: priority.id, priorityId: priority.id, hours: slaHours } });
  }

  const passwordHash = "$2b$12$Ouc69MMmHv/xAUmNHmwydOtYux9f9OOdFTLBhqlmnCRBVicVi8cha";
  const admin = await prisma.user.upsert({
    where: { email: "CD.ADMIN" },
    update: {},
    create: {
      email: "CD.ADMIN",
      passwordHash,
      firstName: "Administrador",
      lastName: "General",
      position: "Administrador General",
      area: "Sistemas",
      roleId: adminRole.id
    }
  });

  const allModules = await prisma.supportModule.findMany();
  for (const module of allModules) {
    await prisma.userModule.upsert({
      where: { userId_moduleId: { userId: admin.id, moduleId: module.id } },
      update: {},
      create: { userId: admin.id, moduleId: module.id }
    });
  }

  const demoUsers = ["soporte@empresa.com", "jefe.rrhh@empresa.com", "usuario@empresa.com"];
  const demoTickets = await prisma.ticket.findMany({ where: { number: { startsWith: "TK-" } }, select: { id: true } });
  const demoTicketIds = demoTickets.map((ticket) => ticket.id);
  if (demoTicketIds.length > 0) {
    await prisma.ticketAttachment.deleteMany({ where: { ticketId: { in: demoTicketIds } } });
    await prisma.ticketComment.deleteMany({ where: { ticketId: { in: demoTicketIds } } });
    await prisma.ticketAssignment.deleteMany({ where: { ticketId: { in: demoTicketIds } } });
    await prisma.slaEvent.deleteMany({ where: { ticketId: { in: demoTicketIds } } });
    await prisma.ticket.deleteMany({ where: { id: { in: demoTicketIds } } });
  }
  const demoUserRows = await prisma.user.findMany({ where: { email: { in: demoUsers } }, select: { id: true } });
  const demoUserIds = demoUserRows.map((user) => user.id);
  if (demoUserIds.length > 0) {
    await prisma.notification.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.session.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.userModule.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.ticketComment.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.ticketAssignment.deleteMany({ where: { assigneeId: { in: demoUserIds } } });
    await prisma.auditLog.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });
  }

  // System settings
  for (const [key, value] of defaultSettings) {
    await prisma.systemSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  // Email templates
  for (const tpl of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { key: tpl.key },
      update: { name: tpl.name, subject: tpl.subject, html: tpl.html },
      create: tpl
    });
  }

}

main().finally(async () => prisma.$disconnect());
