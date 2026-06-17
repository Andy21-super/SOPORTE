import { api } from "./api";

export async function getRoles() {
  const { data } = await api.get("/roles");
  return data;
}

export async function getPermissions() {
  const { data } = await api.get("/roles/permissions");
  return data;
}

export async function saveRole(input: { id?: string; name: string; description?: string; permissionIds: string[] }) {
  const { data } = input.id ? await api.patch(`/roles/${input.id}`, input) : await api.post("/roles", input);
  return data;
}
