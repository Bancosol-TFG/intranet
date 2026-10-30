import { request, type PageResponse } from "./api";

export type Zone = {
  id: number;
  name: string;
  code: string;
};

export type ZoneInput = Omit<Zone, "id">;

export type ZoneFilters = {
  name: string;
  code: string;
  page: number;
};

export function listZones(filters: ZoneFilters): Promise<PageResponse<Zone>> {
  const params = new URLSearchParams({ page: String(filters.page), size: "10", sort: "name,asc" });
  if (filters.name) params.set("name", filters.name);
  if (filters.code) params.set("code", filters.code);
  return request(`/zones?${params.toString()}`);
}

export function createZone(input: ZoneInput): Promise<Zone> {
  return request("/zones", { method: "POST", body: JSON.stringify(input) });
}

export function updateZone(zoneId: number, input: ZoneInput): Promise<Zone> {
  return request(`/zones/${zoneId}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteZone(zoneId: number): Promise<void> {
  return request(`/zones/${zoneId}`, { method: "DELETE" });
}
