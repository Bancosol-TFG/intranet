package es.bancosol.api.common.validation;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.ReportAsSingleViolation;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.ElementType.TYPE_USE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Pattern(regexp = PhoneNumber.PATTERN)
@Size(max = PhoneNumber.MAX_LENGTH)
@ReportAsSingleViolation
@Target({FIELD, METHOD, PARAMETER, TYPE_USE})
@Retention(RUNTIME)
@Constraint(validatedBy = {})
public @interface PhoneNumber {
    String PATTERN = "(?s).*\\p{Nd}.*";

    int MAX_LENGTH = 50;

    String message() default "must contain at least one digit and be at most " + MAX_LENGTH + " characters";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
