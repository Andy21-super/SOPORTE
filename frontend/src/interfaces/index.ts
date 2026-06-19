export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  area: string;
  role: string;
  permissions: string[];
  modules?: CatalogItem[];
}

export interface CatalogItem {
  id: string;
  name: string;
  color?: string;
  slaHours?: number;
  enabled?: boolean;
}

export interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string;
  area: string;
  position: string;
  requesterIp?: string;
  deviceId?: string;
  deleted?: boolean;
  createdAt: string;
  slaDueAt?: string;
  reopenedCount: number;
  requester: User;
  module: CatalogItem;
  category: CatalogItem;
  priority: CatalogItem;
  status: CatalogItem;
  comments: TicketComment[];
}

export interface TicketComment {
  id: string;
  message: string;
  internal: boolean;
  createdAt: string;
  user: User;
}

export interface DashboardResponse {
  kpis: Record<string, number>;
  charts?: Record<string, Array<{ name: string; value: number; color?: string }>>;
  recentTickets?: Array<{
    id: string;
    number: string;
    subject: string;
    status: string;
    statusColor: string;
    priority: string;
    priorityColor: string;
    module: string;
    requester: string;
    createdAt: string;
  }>;
}
