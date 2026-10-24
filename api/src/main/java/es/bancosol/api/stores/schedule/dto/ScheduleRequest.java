package es.bancosol.api.stores.schedule.dto;

import java.time.LocalTime;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@ValidTimeRange
public record ScheduleRequest(@NotNull @Min(1) @Max(7) Integer weekDay,
                              @NotNull LocalTime openingTime, @NotNull LocalTime closingTime) implements TimeRange {
}
