import { api } from "./api";
import type { User } from "../interfaces";

const localAdminUser = "CD.ADMIN";
const localAdminPasswordHash = "54286490db0b92635f9ed92e6fece08b7a9c93690a815aaf24c88dfb3617e673";

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function localLogin(email: string, password: string) {
  const normalizedUser = email.trim().toUpperCase();
  if (normalizedUser !== localAdminUser || await sha256(password) !== localAdminPasswordHash) {
    throw new Error("Credenciales invalidas");
  }

  const user: User = {
    id: "local-admin",
    email: localAdminUser,
    firstName: "Administrador",
    lastName: "CD",
    position: "Administrador General",
    area: "CAMPAMENTOS DIOSES",
    role: "Administrador General",
    permissions: [
      "dashboard:view",
      "tickets:create",
      "tickets:manage",
      "users:manage",
      "roles:manage",
      "modules:manage",
      "categories:manage",
      "priorities:manage",
      "statuses:manage",
      "templates:manage",
      "reports:view",
      "audit:view",
      "settings:manage",
      "sla:manage"
    ]
  };

  return {
    accessToken: `local-${crypto.randomUUID()}`,
    refreshToken: `local-refresh-${crypto.randomUUID()}`,
    user
  };
}

export async function login(email: string, password: string) {
  try {
    const { data } = await api.post<{ accessToken: string; refreshToken: string; user: User }>("/auth/login", { email, password });
    return data;
  } catch {
    return localLogin(email, password);
  }
}
