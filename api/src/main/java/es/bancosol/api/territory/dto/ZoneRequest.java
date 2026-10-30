package es.bancosol.api.territory.dto;

import jakarta.validation.constraints.NotBlank;

public record ZoneRequest(@NotBlank String name, @NotBlank String code) {
}
