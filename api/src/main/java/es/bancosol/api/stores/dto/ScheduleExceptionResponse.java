package es.bancosol.api.stores.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import es.bancosol.api.stores.entity.ScheduleException;

public record ScheduleExceptionResponse(Integer id, LocalDate date, boolean closed,
                                        LocalTime openingTime, LocalTime closingTime) {
    public static ScheduleExceptionResponse from(ScheduleException exception) {
        return new ScheduleExceptionResponse(exception.getId(), exception.getDate(), exception.isClosed(),
                exception.getOpeningTime(), exception.getClosingTime());
    }
}
