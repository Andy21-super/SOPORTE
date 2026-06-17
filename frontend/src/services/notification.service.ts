import { api } from "./api";

export async function getNotifications() {
  const { data } = await api.get("/notifications");
  return data;
}
