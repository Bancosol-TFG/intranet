package es.bancosol.api.roles.dto;

import es.bancosol.api.roles.entity.Permission;

public record PermissionResponse(Integer id, String name, String description) {
    public static PermissionResponse from(Permission permission) {
        return new PermissionResponse(permission.getId(), permission.getName(), permission.getDescription());
    }
}
