package es.bancosol.api.stores.schedule.dto;

import java.time.LocalTime;
import java.util.List;
import es.bancosol.api.stores.schedule.entity.Schedule;

public record ScheduleDayResponse(Integer weekDay, List<Slot> slots) {
    public record Slot(Integer id, LocalTime openingTime, LocalTime closingTime) {
        public static Slot from(Schedule schedule) {
            return new Slot(schedule.getId(), schedule.getOpeningTime(), schedule.getClosingTime());
        }
    }
}
