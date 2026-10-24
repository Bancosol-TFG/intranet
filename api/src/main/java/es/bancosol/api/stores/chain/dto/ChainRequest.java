package es.bancosol.api.stores.chain.dto;

import jakarta.validation.constraints.NotBlank;

public record ChainRequest(@NotBlank String code) {
}
