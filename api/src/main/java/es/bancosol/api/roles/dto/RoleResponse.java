package es.bancosol.api.roles.dto;

import es.bancosol.api.roles.entity.Role;

public record RoleResponse(Integer id, String name) {
    public static RoleResponse from(Role role) {
        return new RoleResponse(role.getId(), role.getName());
    }
}
