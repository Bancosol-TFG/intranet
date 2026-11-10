import { request, type PageResponse } from "../../shared/api/client";

import type { Chain, ChainFilters, ChainRequest } from "./storesTypes";

function listChains(filters: ChainFilters): Promise<PageResponse<Chain>> {
  const params = new URLSearchParams({ page: String(filters.page), size: "10", sort: "code,asc" });
  if (filters.code) params.set("code", filters.code);
  return request(`/chains?${params.toString()}`);
}

function getChain(chainId: number): Promise<Chain> {
  return request(`/chains/${chainId}`);
}

function createChain(input: ChainRequest): Promise<Chain> {
  return request("/chains", { method: "POST", body: JSON.stringify(input) });
}

function updateChain(chainId: number, input: ChainRequest): Promise<Chain> {
  return request(`/chains/${chainId}`, { method: "PUT", body: JSON.stringify(input) });
}

function removeChain(chainId: number): Promise<void> {
  return request(`/chains/${chainId}`, { method: "DELETE" });
}

export const chainsApi = {
  list: listChains,
  get: getChain,
  create: createChain,
  update: updateChain,
  remove: removeChain,
};
