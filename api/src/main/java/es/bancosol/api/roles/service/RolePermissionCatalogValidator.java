package es.bancosol.api.roles.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import es.bancosol.api.roles.dto.CatalogPermission;
import es.bancosol.api.roles.dto.CatalogPermissionReference;
import es.bancosol.api.roles.dto.CatalogRole;
import es.bancosol.api.roles.dto.CatalogSource;

public class RolePermissionCatalogValidator {
    private static final Pattern PERMISSION_NAME_PATTERN = Pattern
            .compile("^[A-Z]+(?:_[A-Z]+)*_(LIST|READ|CREATE|UPDATE|DELETE|ASSIGN|REVOKE)\\z");

    public void validate(List<CatalogPermission> permissions, List<CatalogRole> roles) {
        if (permissions.isEmpty()) {
            throw new CatalogValidationException("El catálogo global de permisos está vacío.");
        }
        if (roles.isEmpty()) {
            throw new CatalogValidationException("El catálogo global de roles está vacío.");
        }

        Map<String, CatalogPermission> permissionsByName = validatePermissions(permissions);
        Map<String, CatalogRole> rolesByName = new HashMap<>();
        for (CatalogRole role : roles) {
            CatalogRole previousRole = rolesByName.putIfAbsent(role.name(), role);
            if (previousRole != null) {
                throw duplicateValue("rol", role.name(), role.nameSource(), previousRole.nameSource());
            }
            validateRoleAssignments(role, permissionsByName);
        }
    }

    private Map<String, CatalogPermission> validatePermissions(List<CatalogPermission> permissions) {
        Map<String, CatalogPermission> permissionsByName = new HashMap<>();
        for (CatalogPermission permission : permissions) {
            if (!PERMISSION_NAME_PATTERN.matcher(permission.name()).matches()) {
                throw invalid(permission.nameSource(), "El permiso '" + permission.name()
                        + "' debe usar el formato RECURSO_OPERACIÓN y una operación admitida.");
            }
            CatalogPermission previousPermission = permissionsByName.putIfAbsent(permission.name(), permission);
            if (previousPermission != null) {
                throw duplicateValue("permiso", permission.name(), permission.nameSource(), previousPermission.nameSource());
            }
        }
        return permissionsByName;
    }

    private void validateRoleAssignments(CatalogRole role, Map<String, CatalogPermission> permissionsByName) {
        Set<String> rolePermissionNames = new HashSet<>();
        for (CatalogPermissionReference permission : role.permissions()) {
            if (!rolePermissionNames.add(permission.name())) {
                throw invalid(permission.source(), "El permiso '" + permission.name()
                        + "' está asignado más de una vez al rol '" + role.name() + "'.");
            }
            if (!permissionsByName.containsKey(permission.name())) {
                throw invalid(permission.source(), "El permiso '" + permission.name() + "' del rol '" + role.name()
                        + "' no existe en el catálogo global.");
            }
        }
    }

    private CatalogValidationException duplicateValue(String type, String value, CatalogSource source,
            CatalogSource previousSource) {
        return invalid(source, "El " + type + " '" + value + "' está duplicado; primera aparición en "
                + previousSource.describe() + ".");
    }

    private CatalogValidationException invalid(CatalogSource source, String message) {
        return new CatalogValidationException(source.describe() + ": " + message);
    }
}
