package es.bancosol.api.collaborator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CollaboratorRequest(@NotBlank String name,
                                  @NotBlank String address,
                                  @NotNull @Positive Integer localityId) {
}
