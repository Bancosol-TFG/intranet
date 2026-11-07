package es.bancosol.api.roles.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleRequest(@NotBlank String name) {
}
