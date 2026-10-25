export type CampaignType = {
  id: number;
  name: string;
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

type CampaignTypePayload = {
  name: string;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function errorMessage(response: Response): Promise<string> {
  if (response.status === 409) {
    return "Ya existe un registro con ese nombre.";
  }
  if (response.status === 404) {
    return "El registro ya no existe.";
  }
  if (response.status === 400) {
    return "Revisa los datos del formulario.";
  }
  return "No se ha podido completar la operación.";
}

export const campaignTypesApi = {
  list(name: string, page: number) {
    const params = new URLSearchParams({ page: String(page), size: "10", sort: "name,asc" });
    if (name) {
      params.set("name", name);
    }
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
