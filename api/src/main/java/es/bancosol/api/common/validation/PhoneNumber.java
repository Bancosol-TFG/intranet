package es.bancosol.api.common.validation;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.ReportAsSingleViolation;
import jakarta.validation.constraints.Pattern;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.ElementType.TYPE_USE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Pattern(regexp = PhoneNumber.PATTERN)
@ReportAsSingleViolation
@Target({FIELD, METHOD, PARAMETER, TYPE_USE})
@Retention(RUNTIME)
@Constraint(validatedBy = {})
public @interface PhoneNumber {
    String PATTERN = "^(\\+[0-9]{1,3} ?)?[0-9]{9}$";

    String message() default "must be 9 digits, optionally preceded by an international prefix such as +34";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
