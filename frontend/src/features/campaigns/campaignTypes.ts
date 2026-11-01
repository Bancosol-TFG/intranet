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

export type CampaignType = {
  id: number;
  name: string;
};

export type CampaignTypePayload = {
  name: string;
};
