import { api } from "./api";
import type { CatalogItem, DashboardResponse, Ticket } from "../interfaces";

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
  const { data } = await api.get<{ areas: CatalogItem[]; priorities: CatalogItem[]; settings: Array<{ key: string; value: string }> }>("/public/bootstrap");
  return data;
}

export async function getPublicTicketsByIp() {
  const { data } = await api.get<Ticket[]>("/tickets/public/by-ip");
  return data;
}

export async function getPublicTicket(id: string) {
  const { data } = await api.get<Ticket>(`/tickets/public/${id}`);
  return data;
}

export async function getTickets() {
  const { data } = await api.get<Ticket[]>("/tickets");
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

export async function addComment(ticketId: string, input: { message: string; noSolucionado?: boolean }) {
  const { data } = await api.post(`/tickets/${ticketId}/comments`, input);
  return data;
}

export async function addPublicComment(ticketId: string, input: { message: string; noSolucionado?: boolean }) {
  const { data } = await api.post(`/tickets/public/${ticketId}/comments`, input);
  return data;
}
