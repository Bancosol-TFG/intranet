package es.bancosol.api.auth.dto;

import es.bancosol.api.common.validation.ShortText;
import es.bancosol.api.auth.entity.AuthClient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LoginRequest(@NotBlank @Email @ShortText String email,
                           @NotBlank @Size(max = PasswordLimits.MAX_LENGTH) String password,
                           @NotNull AuthClient client) {
}
