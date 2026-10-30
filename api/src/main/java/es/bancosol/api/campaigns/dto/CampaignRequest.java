package es.bancosol.api.campaigns.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CampaignRequest(
        @NotBlank String name,
        @NotNull Integer campaignTypeId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate) {
}
