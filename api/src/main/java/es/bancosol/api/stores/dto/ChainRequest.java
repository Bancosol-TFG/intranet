package es.bancosol.api.stores.dto;

import es.bancosol.api.common.validation.ShortText;
import jakarta.validation.constraints.NotBlank;

public record ChainRequest(@NotBlank @ShortText String name,
                           @NotBlank @ShortText String code) {
}
