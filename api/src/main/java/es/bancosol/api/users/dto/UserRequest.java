package es.bancosol.api.users.dto;

import java.util.List;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record UserRequest(@NotBlank String firstName, String surname, String phoneNumber,
                          @NotBlank @Email String email, @NotEmpty List<@NotBlank String> roles) {
}
