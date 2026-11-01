package es.bancosol.api.auth.dto;

import es.bancosol.api.auth.entity.AuthClient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginRequest(@NotBlank @Email String email, @NotBlank String password, @NotNull AuthClient client) {
}
