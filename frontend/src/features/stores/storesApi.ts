import { request, type PageResponse } from "../../shared/api/client";

import type { Store, StoreFilters, StoreRequest } from "./storesTypes";

function listStores(filters: StoreFilters): Promise<PageResponse<Store>> {
  const params = new URLSearchParams({ page: String(filters.page), size: "10", sort: "name,asc" });
  if (filters.name) params.set("name", filters.name);
  if (filters.chainId !== null) params.set("chainId", String(filters.chainId));
  return request(`/stores?${params.toString()}`);
}

function getStore(storeId: number): Promise<Store> {
  return request(`/stores/${storeId}`);
}

function createStore(input: StoreRequest): Promise<Store> {
  return request("/stores", { method: "POST", body: JSON.stringify(input) });
}

function updateStore(storeId: number, input: StoreRequest): Promise<Store> {
  return request(`/stores/${storeId}`, { method: "PUT", body: JSON.stringify(input) });
}

function deleteStore(storeId: number): Promise<void> {
  return request(`/stores/${storeId}`, { method: "DELETE" });
}

export const storesApi = {
  list: listStores,
  get: getStore,
  create: createStore,
  update: updateStore,
  delete: deleteStore,
};
