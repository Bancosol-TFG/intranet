package es.bancosol.api.collaborator.dto;

import es.bancosol.api.common.validation.PhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactRequest(@NotBlank String name,
                             @Email String email,
                             @PhoneNumber String phoneNumber) {
}
