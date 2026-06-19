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
  const optimizedLogo = await optimizeLogo(file);
  const formData = new FormData();
  formData.append("logo", optimizedLogo);
  const { data } = await api.post("/admin/catalogs/settings/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

async function optimizeLogo(file: File) {
  if (!file.type.toLowerCase().startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen valida");
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("El navegador no pudo leer esta imagen"));
      element.src = sourceUrl;
    });
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo procesar la imagen");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("No se pudo convertir la imagen")), "image/png");
    });
    return new File([blob], `logo-${Date.now()}.png`, { type: "image/png" });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
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
