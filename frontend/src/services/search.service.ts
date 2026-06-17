import { api } from "./api";

export interface SearchResults {
  tickets: any[];
  users: any[];
  modules: any[];
  categories: any[];
  settings: any[];
}

export async function searchGlobal(query: string): Promise<SearchResults> {
  const { data } = await api.get<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
  return data;
}
