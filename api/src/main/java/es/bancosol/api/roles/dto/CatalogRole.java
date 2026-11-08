package es.bancosol.api.roles.dto;

import java.util.List;

public record CatalogRole(String name, List<CatalogPermissionReference> permissions, CatalogSource nameSource) {
}
