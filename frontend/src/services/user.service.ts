import { api } from "./api";

export async function getUsers() {
  const { data } = await api.get("/users");
  return data;
}

export async function saveUser(input: any) {
  const payload = { ...input };
  if (!payload.password) delete payload.password;
  const { data } = input.id ? await api.patch(`/users/${input.id}`, payload) : await api.post("/users", payload);
  return data;
}

export async function toggleUser(id: string) {
  const { data } = await api.patch(`/users/${id}/toggle`);
  return data;
}
