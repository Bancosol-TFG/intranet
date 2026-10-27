package es.bancosol.api.stores.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record StoreRequest(@NotBlank String name, @NotBlank String address,
                           @NotNull @PositiveOrZero Integer checkoutShelfs, @NotNull Integer chainId) {
}
