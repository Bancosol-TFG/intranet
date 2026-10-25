package es.bancosol.api.campaigns.dto;

import es.bancosol.api.campaigns.entity.CampaignType;

public record CampaignTypeResponse(Integer id, String name) {
    public static CampaignTypeResponse from(CampaignType campaignType) {
        return new CampaignTypeResponse(campaignType.getId(), campaignType.getName());
    }
}
