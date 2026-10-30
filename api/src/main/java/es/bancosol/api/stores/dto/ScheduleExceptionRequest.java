package es.bancosol.api.stores.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

@ValidTimeRange
public record ScheduleExceptionRequest(@NotNull LocalDate date, @NotNull Boolean closed,
                                       LocalTime openingTime, LocalTime closingTime) implements TimeRange {
    @AssertTrue
    public boolean isConsistent() {
        return closed == null || (closed ? openingTime == null && closingTime == null
                : openingTime != null && closingTime != null);
    }
}
