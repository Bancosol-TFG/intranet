package es.bancosol.api.users.dto;

import es.bancosol.api.common.validation.ShortText;
import es.bancosol.api.common.validation.PhoneNumber;
import java.util.List;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record UserRequest(@NotBlank @ShortText String firstName,
                          @ShortText String surname, @PhoneNumber String phoneNumber,
                          @NotBlank @Email @ShortText String email,
                          @NotEmpty List<@NotBlank @ShortText String> roles) {
}
