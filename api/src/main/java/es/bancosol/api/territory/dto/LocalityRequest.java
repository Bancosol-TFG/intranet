package es.bancosol.api.territory.dto;

import jakarta.validation.constraints.NotBlank;

public record LocalityRequest(@NotBlank String name, @NotBlank String postalCode) {
}
