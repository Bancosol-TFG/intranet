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
