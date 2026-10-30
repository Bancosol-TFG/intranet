package es.bancosol.api.territory.dto;

import es.bancosol.api.territory.entity.Zone;

public record ZoneResponse(Integer id, String name, String code) {
    public static ZoneResponse from(Zone zone) {
        return new ZoneResponse(zone.getId(), zone.getName(), zone.getCode());
    }
}
