package es.bancosol.api.common.validation;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Size;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.ElementType.TYPE_USE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Size(max = ShortText.MAX_LENGTH)
@Target({FIELD, METHOD, PARAMETER, TYPE_USE})
@Retention(RUNTIME)
@Constraint(validatedBy = {})
public @interface ShortText {
    int MAX_LENGTH = 255;

    String message() default "size must be at most " + MAX_LENGTH;
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
