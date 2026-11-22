package es.bancosol.api.roles.dto;

import es.bancosol.api.common.validation.ShortText;
import jakarta.validation.constraints.NotBlank;

public record RoleRequest(@NotBlank @ShortText String name) {
}
