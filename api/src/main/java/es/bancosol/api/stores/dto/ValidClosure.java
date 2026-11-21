package es.bancosol.api.stores.dto;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target(TYPE)
@Retention(RUNTIME)
@Constraint(validatedBy = ClosureValidator.class)
public @interface ValidClosure {
    String message() default "must be empty when closed and present when open";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
