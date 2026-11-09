export type Chain = {
  id: number;
  code: string;
};

export type ChainRequest = {
  code: string;
};

export type ChainFilters = {
  code: string;
  page: number;
};
