import { api } from "./api";

export async function getAdminCatalogs() {
  const { data } = await api.get("/admin/catalogs");
  return data;
}

export async function saveModule(input: { id?: string; name: string; enabled: boolean }) {
  const { data } = input.id ? await api.patch(`/modules/${input.id}`, input) : await api.post("/modules", input);
  return data;
}

export async function saveCategory(input: { id?: string; name: string; enabled: boolean }) {
  const { data } = input.id ? await api.patch(`/admin/catalogs/categories/${input.id}`, input) : await api.post("/admin/catalogs/categories", input);
  return data;
}

export async function savePriority(input: { id?: string; name: string; color: string; slaHours: number; enabled: boolean }) {
  const { data } = input.id ? await api.patch(`/admin/catalogs/priorities/${input.id}`, input) : await api.post("/admin/catalogs/priorities", input);
  return data;
}

export async function saveStatus(input: { id?: string; name: string; color: string; enabled: boolean }) {
  const { data } = input.id ? await api.patch(`/admin/catalogs/statuses/${input.id}`, input) : await api.post("/admin/catalogs/statuses", input);
  return data;
}

export async function saveSettings(input: Record<string, string>) {
  const { data } = await api.put("/admin/catalogs/settings", input);
  return data;
}

export async function uploadLogo(file: File) {
  const formData = new FormData();
  formData.append("logo", file);
  const { data } = await api.post("/admin/catalogs/settings/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function saveSlaRules(input: Array<{ priorityId: string; hours: number; warn75: boolean; warn90: boolean; warn100: boolean }>) {
  const { data } = await api.put("/admin/catalogs/sla-rules", input);
  return data;
}

export async function saveEmailTemplate(input: { id?: string; key: string; name: string; subject: string; html: string }) {
  const { data } = input.id
    ? await api.put(`/admin/catalogs/email-templates/${input.id}`, input)
    : await api.post("/admin/catalogs/email-templates", input);
  return data;
}
