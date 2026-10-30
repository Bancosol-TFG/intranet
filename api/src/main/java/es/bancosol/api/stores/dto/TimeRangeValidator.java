package es.bancosol.api.stores.dto;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TimeRangeValidator implements ConstraintValidator<ValidTimeRange, TimeRange> {
    @Override
    public boolean isValid(TimeRange range, ConstraintValidatorContext context) {
        return range == null || range.openingTime() == null || range.closingTime() == null
                || range.closingTime().isAfter(range.openingTime());
    }
}
