package es.bancosol.api.campaigns.dto;

import es.bancosol.api.common.validation.ShortText;
import jakarta.validation.constraints.NotBlank;

public record CampaignTypeRequest(@NotBlank @ShortText String name) {
}
