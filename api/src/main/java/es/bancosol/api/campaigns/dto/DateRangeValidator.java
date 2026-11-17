package es.bancosol.api.campaigns.dto;

import es.bancosol.api.common.validation.FieldViolations;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DateRangeValidator implements ConstraintValidator<ValidDateRange, CampaignRequest> {

    private static final String END_DATE_FIELD = "endDate";

    @Override
    public boolean isValid(CampaignRequest request, ConstraintValidatorContext context) {
        if (request == null || request.startDate() == null || request.endDate() == null
                || !request.endDate().isBefore(request.startDate())) {
            return true;
        }
        return FieldViolations.reject(context, END_DATE_FIELD);
    }
}
