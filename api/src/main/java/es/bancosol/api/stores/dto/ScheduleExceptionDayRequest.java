package es.bancosol.api.stores.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ScheduleExceptionDayRequest(LocalDate originalDate, @NotNull LocalDate date,
        @NotNull Boolean closed, @NotNull List<@NotNull @Valid Slot> slots,
        @NotNull List<@NotNull @Valid Expected> expected) {

    @ValidTimeRange
    public record Slot(@Positive Integer id, @NotNull LocalTime openingTime, @NotNull LocalTime closingTime)
            implements TimeRange {
    }

    public record Expected(@NotNull @Positive Integer id, @NotNull LocalDate date, @NotNull Boolean closed,
            LocalTime openingTime, LocalTime closingTime) {
    }
}
