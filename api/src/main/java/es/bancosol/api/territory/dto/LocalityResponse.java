package es.bancosol.api.territory.dto;

import es.bancosol.api.territory.entity.Locality;

public record LocalityResponse(Integer id, String name, String postalCode) {
    public static LocalityResponse from(Locality locality) {
        return new LocalityResponse(locality.getId(), locality.getName(), locality.getPostalCode());
    }
}
