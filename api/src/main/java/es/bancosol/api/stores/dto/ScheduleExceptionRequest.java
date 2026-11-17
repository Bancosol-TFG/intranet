package es.bancosol.api.stores.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.validation.constraints.NotNull;

@ValidTimeRange
@ValidClosure
public record ScheduleExceptionRequest(@NotNull LocalDate date, @NotNull Boolean closed,
                                       LocalTime openingTime, LocalTime closingTime) implements ClosableTimeRange {
}
