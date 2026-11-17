package es.bancosol.api.stores.dto;

import es.bancosol.api.common.validation.FieldViolations;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TimeRangeValidator implements ConstraintValidator<ValidTimeRange, TimeRange> {

    private static final String CLOSING_TIME_FIELD = "closingTime";

    @Override
    public boolean isValid(TimeRange range, ConstraintValidatorContext context) {
        if (range == null || range.openingTime() == null || range.closingTime() == null
                || range.closingTime().isAfter(range.openingTime())) {
            return true;
        }
        return FieldViolations.reject(context, CLOSING_TIME_FIELD);
    }
}
