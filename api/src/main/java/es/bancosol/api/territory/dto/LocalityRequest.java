package es.bancosol.api.territory.dto;

import es.bancosol.api.common.validation.ShortText;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LocalityRequest(@NotBlank @ShortText String name,
                              @NotBlank @Pattern(regexp = LocalityRequest.POSTAL_CODE_PATTERN) String postalCode) {

    public static final String POSTAL_CODE_PATTERN = "^[0-9]{5}$";
}
