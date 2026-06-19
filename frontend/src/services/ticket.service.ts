import { api } from "./api";
import { getDeviceId } from "../hooks/useDeviceId";
import type { CatalogItem, DashboardResponse, Ticket } from "../interfaces";
import {
  addLocalPublicComment,
  createLocalPublicTicket,
  disableLocalTicket,
  getLocalAdminTickets,
  getLocalPublicTicket,
  getLocalPublicTickets,
  publicPriorities,
  publicProjects,
  publicSettings
} from "../constants/publicCatalogs";

export async function getDashboard(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const { data } = await api.get<any>(`/dashboard?${params.toString()}`);
  return data;
}

export async function getCatalogs() {
  const { data } = await api.get<{ modules: CatalogItem[]; categories: CatalogItem[]; priorities: CatalogItem[]; statuses: CatalogItem[] }>("/catalogs");
  return data;
}

export async function getPublicBootstrap() {
  try {
    const { data } = await api.get<{ areas: CatalogItem[]; priorities: CatalogItem[]; settings: Array<{ key: string; value: string }> }>("/public/bootstrap");
    const areas = Array.isArray(data?.areas) ? data.areas : [];
    const priorities = Array.isArray(data?.priorities) ? data.priorities : [];
    const settings = Array.isArray(data?.settings) ? data.settings : [];
    return {
      areas: areas.length > 0 ? areas : publicProjects,
      priorities: priorities.length > 0 ? priorities : publicPriorities,
      settings: settings.length > 0 ? settings : publicSettings
    };
  } catch {
    return { areas: publicProjects, priorities: publicPriorities, settings: publicSettings };
  }
}

export async function getPublicTicketsByIp() {
  try {
    const { data } = await api.get<Ticket[]>("/tickets/public/by-ip");
    return data;
  } catch {
    return getLocalPublicTickets();
  }
}

export async function getPublicTicket(id: string) {
  try {
    const { data } = await api.get<Ticket>(`/tickets/public/${id}`);
    return data;
  } catch {
    const ticket = getLocalPublicTicket(id);
    if (!ticket) throw new Error("Ticket no encontrado");
    return ticket;
  }
}

export async function getTickets() {
  try {
    const { data } = await api.get<Ticket[]>("/tickets");
    return data;
  } catch {
    return getLocalAdminTickets();
  }
}

export async function getTicket(id: string) {
  try {
    const { data } = await api.get<Ticket>(`/tickets/${id}`);
    return data;
  } catch {
    const ticket = getLocalPublicTicket(id);
    if (!ticket) throw new Error("Ticket no encontrado");
    return ticket;
  }
}

export async function createTicket(input: { moduleId: string; categoryId: string; priorityId: string; subject: string; description: string }) {
  const { data } = await api.post<Ticket>("/tickets", input);
  return data;
}

export async function createPublicTicket(input: {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  area: string;
  description: string;
  priorityId?: string;
}) {
  try {
    const { data } = await api.post<Ticket>("/tickets/public", input);
    return data;
  } catch {
    return createLocalPublicTicket(input, getDeviceId());
  }
}

export async function disableTicket(ticketId: string) {
  try {
    const { data } = await api.delete<Ticket>(`/tickets/${ticketId}`);
    return data;
  } catch {
    return disableLocalTicket(ticketId);
  }
}

export async function addComment(ticketId: string, input: { message: string; noSolucionado?: boolean }) {
  try {
    const { data } = await api.post(`/tickets/${ticketId}/comments`, input);
    return data;
  } catch {
    return addLocalPublicComment(ticketId, input.message);
  }
}

export async function addPublicComment(ticketId: string, input: { message: string; noSolucionado?: boolean }) {
  try {
    const { data } = await api.post(`/tickets/public/${ticketId}/comments`, input);
    return data;
  } catch {
    return addLocalPublicComment(ticketId, input.message);
  }
}
