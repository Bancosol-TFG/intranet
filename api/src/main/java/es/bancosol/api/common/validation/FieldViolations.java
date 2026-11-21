package es.bancosol.api.common.validation;

import jakarta.validation.ConstraintValidatorContext;

public final class FieldViolations {

    private FieldViolations() {
    }

    public static boolean reject(ConstraintValidatorContext context, String... fields) {
        context.disableDefaultConstraintViolation();
        for (String field : fields) {
            context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                    .addPropertyNode(field).addConstraintViolation();
        }
        return false;
    }
}
