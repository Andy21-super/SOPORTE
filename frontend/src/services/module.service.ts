import { getCatalogs } from "./ticket.service";

export async function getModules() {
  const catalogs = await getCatalogs();
  return catalogs.modules;
}
