package es.bancosol.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank @Size(max = PasswordLimits.MAX_LENGTH) String currentPassword,
        @NotBlank @Size(min = PasswordLimits.MIN_LENGTH, max = PasswordLimits.MAX_LENGTH)
        String newPassword) {
}
