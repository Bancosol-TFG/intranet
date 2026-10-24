package es.bancosol.api.stores.schedule.dto;

import java.time.LocalTime;
import es.bancosol.api.stores.schedule.entity.Schedule;

public record ScheduleResponse(Integer id, Integer weekDay, LocalTime openingTime, LocalTime closingTime) {
    public static ScheduleResponse from(Schedule schedule) {
        return new ScheduleResponse(schedule.getId(), schedule.getWeekDay(), schedule.getOpeningTime(),
                schedule.getClosingTime());
    }
}
