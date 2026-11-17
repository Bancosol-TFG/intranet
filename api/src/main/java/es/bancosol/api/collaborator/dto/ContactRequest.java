package es.bancosol.api.collaborator.dto;

import es.bancosol.api.common.validation.ShortText;
import es.bancosol.api.common.validation.PhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactRequest(@NotBlank @ShortText String name,
                             @Email @ShortText String email,
                             @PhoneNumber String phoneNumber) {
}
