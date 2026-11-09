import type { Locality, Zone } from "../territory/territoryTypes";

export type Chain = {
  id: number;
  name: string;
  code: string;
};

export type ChainRequest = {
  name: string;
  code: string;
};

export type ChainFilters = {
  code: string;
  page: number;
};
export type Store = {
  id: number;
  name: string;
  address: string;
  checkoutShelfs: number;
  chain: Chain;
  locality: Locality;
  zone: Zone | null;
};

export type StoreRequest = {
  name: string;
  address: string;
  checkoutShelfs: number;
  chainId: number;
  localityId: number;
  zoneId: number | null;
};

export type StoreFilters = {
  name: string;
  chainId: number | null;
  page: number;
};
