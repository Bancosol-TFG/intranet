package es.bancosol.api.stores.dto;

import jakarta.validation.constraints.NotBlank;

public record ChainRequest(@NotBlank String name, @NotBlank String code) {
}
