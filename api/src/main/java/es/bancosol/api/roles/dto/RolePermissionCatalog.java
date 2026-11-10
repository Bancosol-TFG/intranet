package es.bancosol.api.roles.dto;

import java.util.List;

public record RolePermissionCatalog(List<CatalogPermission> permissions, List<CatalogRole> roles) {
}
