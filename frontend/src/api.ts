const API_PREFIX = "/api";

export type Campaign = {
  id: number;
  name: string;
  campaignTypeId: number;
  campaignTypeName: string;
  startDate: string;
  endDate: string;
};

export type PageResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

export type CampaignTypePayload = {
  name: string;
};

export type CampaignPayload = {
  name: string;
  campaignTypeId: number;
  startDate: string;
  endDate: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_PREFIX}${path}`, { ...init, headers });
  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(response.status));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

function errorMessage(status: number): string {
  if (status === 400) return "Revisa los datos del formulario.";
  if (status === 404) return "No se ha encontrado el registro.";
  if (status === 409) return "La operación entra en conflicto con otros registros.";
  return "No se ha podido completar la operación. Inténtalo de nuevo.";
}

export const campaignTypesApi = {
  list(name: string, page: number) {
    const params = new URLSearchParams({ page: String(page), size: "10", sort: "name,asc" });
    if (name) {
      params.set("name", name);
    }
    return request<PageResponse<CampaignType>>(`/campaign-types?${params.toString()}`);
  },
  listAll() {
    const params = new URLSearchParams({ page: "0", size: "100", sort: "name,asc" });
    return request<PageResponse<CampaignType>>(`/campaign-types?${params.toString()}`);
  },
  create(payload: CampaignTypePayload) {
    return request<CampaignType>("/campaign-types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(campaignTypeId: number, payload: CampaignTypePayload) {
    return request<CampaignType>(`/campaign-types/${campaignTypeId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  remove(campaignTypeId: number) {
    return request<void>(`/campaign-types/${campaignTypeId}`, { method: "DELETE" });
  },
};

export const campaignsApi = {
  list(name: string, campaignTypeId: string, page: number) {
    const params = new URLSearchParams({ page: String(page), size: "10", sort: "startDate,desc" });
    if (name) {
      params.set("name", name);
    }
    if (campaignTypeId) {
      params.set("campaignTypeId", campaignTypeId);
    }
    return request<PageResponse<Campaign>>(`/campaigns?${params.toString()}`);
  },
  create(payload: CampaignPayload) {
    return request<Campaign>("/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(campaignId: number, payload: CampaignPayload) {
    return request<Campaign>(`/campaigns/${campaignId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  remove(campaignId: number) {
    return request<void>(`/campaigns/${campaignId}`, { method: "DELETE" });
  },
};
