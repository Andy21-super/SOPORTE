import { api } from "./api";
import type { CatalogItem, DashboardResponse, Ticket } from "../interfaces";
import {
  getLocalPublicTickets,
  publicPriorities,
  publicProjects,
  publicSettings,
  removeLocalTicket
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
  const localTickets = getLocalPublicTickets();
  for (const ticket of localTickets) {
    try {
      await api.post<Ticket>("/tickets/public", {
        firstName: ticket.requester.firstName,
        lastName: ticket.requester.lastName,
        dni: ticket.position.replace("DNI ", ""),
        email: ticket.requester.email,
        area: ticket.area,
        description: ticket.description
      });
      removeLocalTicket(ticket.id);
    } catch {
      // Se conserva localmente para reintentar sin perderlo.
    }
  }
  const { data } = await api.get<Ticket[]>("/tickets/public/by-ip");
  return data;
}

export async function getPublicTicket(id: string) {
  const { data } = await api.get<Ticket>(`/tickets/public/${id}`);
  return data;
}

export async function getTickets() {
  const { data } = await api.get<Ticket[]>("/tickets?includeDisabled=true");
  return data;
}

export async function getTicket(id: string) {
  const { data } = await api.get<Ticket>(`/tickets/${id}`);
  return data;
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
  const { data } = await api.post<Ticket>("/tickets/public", input);
  return data;
}

export async function disableTicket(ticketId: string) {
  const { data } = await api.delete<Ticket>(`/tickets/${ticketId}`);
  return data;
}

export async function enableTicket(ticketId: string) {
  const { data } = await api.patch<Ticket>(`/tickets/${ticketId}/enable`);
  return data;
}

export async function addComment(ticketId: string, input: { message: string; noSolucionado?: boolean }) {
  const { data } = await api.post(`/tickets/${ticketId}/comments`, input);
  return data;
}

export async function addPublicComment(ticketId: string, input: { message: string; noSolucionado?: boolean }) {
  const { data } = await api.post(`/tickets/public/${ticketId}/comments`, input);
  return data;
}
