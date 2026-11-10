package es.bancosol.api.roles.dto;

public record CatalogPermission(String name, String description, CatalogSource nameSource, CatalogSource descriptionSource) {
}
