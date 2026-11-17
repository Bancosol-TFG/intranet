package es.bancosol.api.common.validation;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class PhoneNumberTests {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    private record Contact(@PhoneNumber String phoneNumber) {
    }

    @ParameterizedTest
    @ValueSource(strings = {"600111222", "952123456", "+34600111222", "+34 600111222", "+32 470123456",
            "+351 912345678"})
    void acceptsNineDigitsWithOptionalInternationalPrefix(String phoneNumber) {
        assertThat(VALIDATOR.validate(new Contact(phoneNumber))).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "         ", "60011122", "6001112223", "600 111 222", "+34", "34 600111222",
            "+1234 600111222", "600-111-222", "llamar luego"})
    void rejectsAnythingElse(String phoneNumber) {
        assertThat(VALIDATOR.validate(new Contact(phoneNumber))).hasSize(1);
    }

    @Test
    void allowsMissingPhoneNumber() {
        assertThat(VALIDATOR.validate(new Contact(null))).isEmpty();
    }
}
