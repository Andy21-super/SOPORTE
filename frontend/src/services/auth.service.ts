import { api } from "./api";
import type { User } from "../interfaces";

export async function login(email: string, password: string) {
  const { data } = await api.post<{ accessToken: string; refreshToken: string; user: User }>("/auth/login", { email, password });
  return data;
}
