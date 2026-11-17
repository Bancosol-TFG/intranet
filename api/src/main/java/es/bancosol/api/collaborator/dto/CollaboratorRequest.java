package es.bancosol.api.collaborator.dto;

import es.bancosol.api.common.validation.ShortText;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CollaboratorRequest(@NotBlank @ShortText String name,
                                  @NotBlank @ShortText String address,
                                  @NotNull @Positive Integer localityId) {
}
