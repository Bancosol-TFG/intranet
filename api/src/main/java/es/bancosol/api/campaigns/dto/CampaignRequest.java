package es.bancosol.api.campaigns.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@ValidDateRange
public record CampaignRequest(
        @NotBlank String name,
        @NotNull @Positive Integer campaignTypeId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate) {
}
