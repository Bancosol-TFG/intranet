package es.bancosol.api.campaigns.dto;

import jakarta.validation.constraints.NotBlank;

public record CampaignTypeRequest(@NotBlank String name) {
}
