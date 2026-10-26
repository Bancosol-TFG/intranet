import { request, type PageResponse } from "./api";

export type Locality = {
  id: number;
  name: string;
  postalCode: string;
};

export type LocalityInput = Omit<Locality, "id">;

export type LocalityFilters = {
  name: string;
  postalCode: string;
  page: number;
};

export function listLocalities(filters: LocalityFilters): Promise<PageResponse<Locality>> {
  const params = new URLSearchParams({ page: String(filters.page), size: "10", sort: "name,asc" });
  if (filters.name) params.set("name", filters.name);
  if (filters.postalCode) params.set("postalCode", filters.postalCode);
  return request(`/localities?${params.toString()}`);
}

export function createLocality(input: LocalityInput): Promise<Locality> {
  return request("/localities", { method: "POST", body: JSON.stringify(input) });
}

export function updateLocality(localityId: number, input: LocalityInput): Promise<Locality> {
  return request(`/localities/${localityId}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteLocality(localityId: number): Promise<void> {
  return request(`/localities/${localityId}`, { method: "DELETE" });
}
