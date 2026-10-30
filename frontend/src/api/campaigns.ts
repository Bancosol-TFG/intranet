import { request, type PageResponse } from "./client";

export type Campaign = {
  id: number;
  name: string;
  campaignTypeId: number;
  campaignTypeName: string;
  startDate: string;
  endDate: string;
};

export type CampaignPayload = {
  name: string;
  campaignTypeId: number;
  startDate: string;
  endDate: string;
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
