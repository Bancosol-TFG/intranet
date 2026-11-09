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
