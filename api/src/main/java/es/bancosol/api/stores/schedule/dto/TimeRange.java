package es.bancosol.api.stores.schedule.dto;

import java.time.LocalTime;

public interface TimeRange {
    LocalTime openingTime();
    LocalTime closingTime();
}
