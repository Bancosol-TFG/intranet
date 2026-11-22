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
            "+351 912345678", "+44 (0)20 7946 0958 ext. 12", "+1 202-555-0144", "12345", "١٢٣"})
    void acceptsDifferentLengthsAndFormats(String phoneNumber) {
        assertThat(VALIDATOR.validate(new Contact(phoneNumber))).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "         ", "+ () -", "call later"})
    void rejectsValuesWithoutDigits(String phoneNumber) {
        assertThat(VALIDATOR.validate(new Contact(phoneNumber))).hasSize(1);
    }

    @Test
    void limitsPhoneNumbersToFiftyCharacters() {
        assertThat(VALIDATOR.validate(new Contact("1".repeat(50)))).isEmpty();
        assertThat(VALIDATOR.validate(new Contact("1".repeat(51)))).hasSize(1);
    }

    @Test
    void allowsMissingPhoneNumber() {
        assertThat(VALIDATOR.validate(new Contact(null))).isEmpty();
    }
}
