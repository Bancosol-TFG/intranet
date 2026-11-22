package es.bancosol.api.stores.dto;

import java.time.LocalTime;
import java.util.stream.Stream;
import es.bancosol.api.common.validation.FieldViolations;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ClosureValidator implements ConstraintValidator<ValidClosure, ClosableTimeRange> {

    private static final String OPENING_TIME_FIELD = "openingTime";
    private static final String CLOSING_TIME_FIELD = "closingTime";

    @Override
    public boolean isValid(ClosableTimeRange range, ConstraintValidatorContext context) {
        if (range == null || range.closed() == null) {
            return true;
        }
        String[] invalidFields = Stream.of(
                        isTimeConsistent(range.closed(), range.openingTime()) ? null : OPENING_TIME_FIELD,
                        isTimeConsistent(range.closed(), range.closingTime()) ? null : CLOSING_TIME_FIELD)
                .filter(field -> field != null).toArray(String[]::new);
        return invalidFields.length == 0 || FieldViolations.reject(context, invalidFields);
    }

    private boolean isTimeConsistent(boolean closed, LocalTime time) {
        return closed == (time == null);
    }
}
