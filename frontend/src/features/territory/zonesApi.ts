import { request, type PageResponse } from "../../shared/api/client";

import type { Zone, ZoneInput, ZoneFilters } from "./territoryTypes";

function listZones(filters: ZoneFilters): Promise<PageResponse<Zone>> {
  const params = new URLSearchParams({ page: String(filters.page), size: "10", sort: "name,asc" });
  if (filters.name) params.set("name", filters.name);
  if (filters.code) params.set("code", filters.code);
  return request(`/zones?${params.toString()}`);
}

function createZone(input: ZoneInput): Promise<Zone> {
  return request("/zones", { method: "POST", body: JSON.stringify(input) });
}

function updateZone(zoneId: number, input: ZoneInput): Promise<Zone> {
  return request(`/zones/${zoneId}`, { method: "PUT", body: JSON.stringify(input) });
}

function deleteZone(zoneId: number): Promise<void> {
  return request(`/zones/${zoneId}`, { method: "DELETE" });
}

export const zonesApi = {
  list: listZones,
  create: createZone,
  update: updateZone,
  delete: deleteZone,
};
