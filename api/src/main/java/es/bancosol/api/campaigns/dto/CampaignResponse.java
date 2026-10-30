package es.bancosol.api.campaigns.dto;

import java.time.LocalDate;
import es.bancosol.api.campaigns.entity.Campaign;

public record CampaignResponse(
        Integer id,
        String name,
        Integer campaignTypeId,
        String campaignTypeName,
        LocalDate startDate,
        LocalDate endDate) {
    public static CampaignResponse from(Campaign campaign) {
        return new CampaignResponse(
                campaign.getId(),
                campaign.getName(),
                campaign.getCampaignType().getId(),
                campaign.getCampaignType().getName(),
                campaign.getStartDate(),
                campaign.getEndDate());
    }
}
