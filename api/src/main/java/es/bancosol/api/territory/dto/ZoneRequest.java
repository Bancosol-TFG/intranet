package es.bancosol.api.territory.dto;

import es.bancosol.api.common.validation.ShortText;
import jakarta.validation.constraints.NotBlank;

public record ZoneRequest(@NotBlank @ShortText String name,
                          @NotBlank @ShortText String code) {
}
