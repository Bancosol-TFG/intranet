import { request, type PageResponse } from "../../shared/api/client";

import type { Locality, LocalityInput, LocalityFilters } from "./territoryTypes";

function listLocalities(filters: LocalityFilters): Promise<PageResponse<Locality>> {
  const params = new URLSearchParams({ page: String(filters.page), size: "10", sort: "name,asc" });
  if (filters.name) params.set("name", filters.name);
  if (filters.postalCode) params.set("postalCode", filters.postalCode);
  return request(`/localities?${params.toString()}`);
}

function createLocality(input: LocalityInput): Promise<Locality> {
  return request("/localities", { method: "POST", body: JSON.stringify(input) });
}

function updateLocality(localityId: number, input: LocalityInput): Promise<Locality> {
  return request(`/localities/${localityId}`, { method: "PUT", body: JSON.stringify(input) });
}

function deleteLocality(localityId: number): Promise<void> {
  return request(`/localities/${localityId}`, { method: "DELETE" });
}

export const localitiesApi = {
  list: listLocalities,
  create: createLocality,
  update: updateLocality,
  delete: deleteLocality,
};
