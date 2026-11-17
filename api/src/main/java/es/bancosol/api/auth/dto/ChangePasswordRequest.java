package es.bancosol.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank @Size(max = LoginRequest.MAX_PASSWORD_LENGTH) String currentPassword,
        @NotBlank @Size(min = ChangePasswordRequest.MIN_PASSWORD_LENGTH, max = LoginRequest.MAX_PASSWORD_LENGTH)
        String newPassword) {

    public static final int MIN_PASSWORD_LENGTH = 8;
}
