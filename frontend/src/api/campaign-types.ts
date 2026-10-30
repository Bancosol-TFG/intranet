import { request, type PageResponse } from "./client";

export type CampaignType = {
  id: number;
  name: string;
};

export type CampaignTypePayload = {
  name: string;
};

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
