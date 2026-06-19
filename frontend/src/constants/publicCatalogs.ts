import type { CatalogItem, Ticket } from "../interfaces";

export const projectAreas: Record<string, string[]> = {
  "Oficina Central": ["Logística", "Costos", "SSOMA", "RR.HH.", "Gerencia", "Ingeniería", "Producción", "Calidad", "Contabilidad"],
  "Antamina Oficinas": ["Residente", "SSOMA", "Calidad", "Topógrafo", "Almacén"],
  "Antamina Hangar": ["Residente", "SSOMA", "Calidad", "Topógrafo", "Almacén"],
  "Tía María Arequipa": ["Residente", "SSOMA", "Calidad", "Topógrafo", "Almacén"],
  "Minsur Pisco": ["Residente", "SSOMA", "Calidad"]
};

export const publicProjects: CatalogItem[] = Object.keys(projectAreas).map((name) => ({
  id: name,
  name,
  enabled: true
}));

export const publicPriorities: CatalogItem[] = [
  { id: "baja", name: "Baja", color: "#2e7d32", slaHours: 72, enabled: true },
  { id: "media", name: "Media", color: "#fbc02d", slaHours: 24, enabled: true },
  { id: "alta", name: "Alta", color: "#ef6c00", slaHours: 8, enabled: true },
  { id: "critica", name: "Crítica", color: "#c62828", slaHours: 4, enabled: true }
];

export const publicSettings = [
  ["company_name", "CAMPAMENTOS DIOSES"],
  ["logo_url", `${import.meta.env.BASE_URL}campamentos-dioses-logo-transparent.png`],
  ["public_title", "Panel publico de soporte TI"],
  ["public_subtitle", "Mesa de ayuda para operaciones, construcción y montaje metálico"],
  ["public_description", "Registre incidencias, solicitudes de acceso, equipos, sistemas o conectividad. Sus tickets creados desde este computador aparecen aqui automaticamente."],
  ["public_background_url", "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=80"]
].map(([key, value]) => ({ key, value }));

const localTicketsKey = "soporte_public_tickets";

export function splitProjectArea(value = "") {
  const [project, ...areaParts] = value.split(" - ");
  return {
    project: project || value,
    area: areaParts.join(" - ") || ""
  };
}

function readLocalTickets(): Ticket[] {
  try {
    return JSON.parse(localStorage.getItem(localTicketsKey) ?? "[]") as Ticket[];
  } catch {
    return [];
  }
}

function writeLocalTickets(tickets: Ticket[]) {
  localStorage.setItem(localTicketsKey, JSON.stringify(tickets));
}

export function getLocalPublicTickets() {
  return readLocalTickets().filter((ticket) => !ticket.deleted);
}

export function getLocalAdminTickets() {
  return readLocalTickets();
}

export function getLocalPublicTicket(id: string) {
  return readLocalTickets().find((ticket) => ticket.id === id && !ticket.deleted);
}

export function getLocalAdminTicket(id: string) {
  return readLocalTickets().find((ticket) => ticket.id === id);
}

export function disableLocalTicket(id: string) {
  const tickets = readLocalTickets();
  const updated = tickets.map((ticket) => ticket.id === id ? { ...ticket, deleted: true } : ticket);
  writeLocalTickets(updated);
  return updated.find((ticket) => ticket.id === id);
}

export function enableLocalTicket(id: string) {
  const tickets = readLocalTickets();
  const updated = tickets.map((ticket) => ticket.id === id ? { ...ticket, deleted: false } : ticket);
  writeLocalTickets(updated);
  return updated.find((ticket) => ticket.id === id);
}

export function addLocalPublicComment(ticketId: string, message: string) {
  const tickets = readLocalTickets();
  const ticketIndex = tickets.findIndex((ticket) => ticket.id === ticketId);
  if (ticketIndex === -1) throw new Error("Ticket no encontrado");
  const ticket = tickets[ticketIndex];
  const comment = {
    id: crypto.randomUUID(),
    message,
    internal: false,
    createdAt: new Date().toISOString(),
    user: ticket.requester
  };
  tickets[ticketIndex] = { ...ticket, comments: [...ticket.comments, comment] };
  writeLocalTickets(tickets);
  return comment;
}

export function addLocalAdminComment(ticketId: string, message: string) {
  const tickets = readLocalTickets();
  const ticketIndex = tickets.findIndex((ticket) => ticket.id === ticketId);
  if (ticketIndex === -1) throw new Error("Ticket no encontrado");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : {
    id: "local-admin",
    email: "admin@local",
    firstName: "Soporte",
    lastName: "TI",
    role: "Administrador",
    permissions: []
  };
  const comment = {
    id: crypto.randomUUID(),
    message,
    internal: false,
    createdAt: new Date().toISOString(),
    user
  };
  tickets[ticketIndex] = { ...tickets[ticketIndex], comments: [...tickets[ticketIndex].comments, comment] };
  writeLocalTickets(tickets);
  return comment;
}

export function createLocalPublicTicket(input: {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  area: string;
  description: string;
  priorityId?: string;
}, deviceId?: string) {
  const tickets = readLocalTickets();
  const priority = publicPriorities.find((item) => item.id === input.priorityId) ?? publicPriorities.find((item) => item.name === "Media") ?? publicPriorities[0];
  const now = new Date();
  const { project } = splitProjectArea(input.area);
  const ticket: Ticket = {
    id: crypto.randomUUID(),
    number: `LOCAL-${now.getFullYear()}-${String(tickets.length + 1).padStart(4, "0")}`,
    subject: `${project} - Solicitud TI de ${input.firstName} ${input.lastName}`,
    description: input.description,
    area: input.area,
    position: `DNI ${input.dni}`,
    requesterIp: deviceId,
    deviceId,
    deleted: false,
    createdAt: now.toISOString(),
    slaDueAt: new Date(now.getTime() + Number(priority.slaHours ?? 24) * 60 * 60 * 1000).toISOString(),
    reopenedCount: 0,
    requester: {
      id: input.email,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      position: `DNI ${input.dni}`,
      area: input.area,
      role: "Usuario Final",
      permissions: []
    },
    module: { id: "sistemas", name: "Sistemas" },
    category: { id: "solicitud", name: "Solicitud" },
    priority,
    status: { id: "nuevo", name: "Nuevo", color: "#1976d2" },
    comments: []
  };
  writeLocalTickets([ticket, ...tickets]);
  return ticket;
}
