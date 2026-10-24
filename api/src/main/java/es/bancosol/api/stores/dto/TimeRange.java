package es.bancosol.api.stores.dto;

import java.time.LocalTime;

public interface TimeRange {
    LocalTime openingTime();
    LocalTime closingTime();
}
