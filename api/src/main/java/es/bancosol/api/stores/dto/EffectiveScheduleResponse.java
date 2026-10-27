package es.bancosol.api.stores.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record EffectiveScheduleResponse(Integer storeId, LocalDate date, Source source, boolean closed, List<Slot> slots) {
    public enum Source { EXCEPTION, WEEKLY }

    public record Slot(LocalTime openingTime, LocalTime closingTime) {}
}
