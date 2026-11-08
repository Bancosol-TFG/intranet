package es.bancosol.api.roles.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.common.security.RequiresPermission;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.repository.PermissionRepository;
import es.bancosol.api.roles.repository.RolePermissionRepository;
import es.bancosol.api.roles.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@Service
@RequiredArgsConstructor
@Slf4j
public class RolePermissionCatalogChecker {
    private final RequestMappingHandlerMapping requestMappingHandlerMapping;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public void checkEndpointsAgainstDatabase() {
        List<EndpointPermission> endpoints = findPermissionEndpoints();
        List<Permission> activePermissions = checkEndpointsAgainstDatabase(endpoints);
        warnAboutDatabasePermissionsWithoutEndpoint(activePermissions, endpoints);
        warnAboutPermissionsWithoutActiveRole(activePermissions);
        log.info("Comprobación endpoint → BD correcta: archivos YAML=no cargados, permisos BD={}, roles BD={}, endpoints={}",
                activePermissions.size(), roleRepository.countByDeletedAtIsNull(), endpoints.size());
    }

    public void checkCatalog(RolePermissionCatalog catalog) {
        List<EndpointPermission> endpoints = findPermissionEndpoints();
        checkEndpointsAgainstCatalog(endpoints, catalog);
        checkEnumMatchesCatalog(catalog);
        List<Permission> activePermissions = checkEndpointsAgainstDatabase(endpoints);
        warnAboutCatalogPermissionsWithoutEndpoint(catalog, endpoints);
        warnAboutPermissionsWithoutActiveRole(activePermissions);
        log.info("Catálogo de roles y permisos comprobado: archivos={}, permisos={}, roles={}, endpoints={}",
                permissionCountsByFile(catalog), catalog.permissions().size(), catalog.roles().size(), endpoints.size());
    }

    public List<EndpointPermission> findPermissionEndpoints() {
        List<EndpointPermission> endpoints = new ArrayList<>();
        requestMappingHandlerMapping.getHandlerMethods().forEach((mapping, handlerMethod) -> {
            RequiresPermission annotation = AnnotatedElementUtils.findMergedAnnotation(
                    handlerMethod.getMethod(), RequiresPermission.class);
            if (annotation != null) {
                addEndpointMappings(endpoints, mapping, handlerMethod, annotation.value());
            }
        });
        return endpoints.stream()
                .sorted(Comparator.comparing(EndpointPermission::path)
                        .thenComparing(EndpointPermission::httpMethod)
                        .thenComparing(EndpointPermission::endpoint))
                .toList();
    }

    private void addEndpointMappings(List<EndpointPermission> endpoints, RequestMappingInfo mapping,
            HandlerMethod handlerMethod, PermissionCode permissionCode) {
        Set<String> paths = mapping.getPatternValues();
        Set<RequestMethod> requestMethods = mapping.getMethodsCondition().getMethods();
        Set<String> httpMethods = requestMethods.isEmpty()
                ? Set.of("*")
                : requestMethods.stream().map(RequestMethod::name).collect(java.util.stream.Collectors.toSet());
        String endpoint = handlerMethod.getBeanType().getSimpleName() + "#" + handlerMethod.getMethod().getName();
        for (String path : paths) {
            for (String httpMethod : httpMethods) {
                endpoints.add(new EndpointPermission(httpMethod, path, endpoint, permissionCode));
            }
        }
    }

    private void checkEndpointsAgainstCatalog(List<EndpointPermission> endpoints, RolePermissionCatalog catalog) {
        Set<String> catalogPermissionNames = catalog.permissions().stream()
                .map(permission -> permission.name())
                .collect(java.util.stream.Collectors.toSet());
        for (EndpointPermission endpoint : endpoints) {
            if (!catalogPermissionNames.contains(endpoint.permissionCode().name())) {
                throw new CatalogValidationException("El permiso '" + endpoint.permissionCode().name()
                        + "' requerido por el endpoint " + endpoint.describe() + " no está declarado en YAML.");
            }
        }
    }

    private void checkEnumMatchesCatalog(RolePermissionCatalog catalog) {
        Map<String, String> enumDescriptions = new TreeMap<>();
        Arrays.stream(PermissionCode.values()).forEach(permissionCode ->
                enumDescriptions.put(permissionCode.name(), permissionCode.getDescription()));
        Map<String, String> catalogDescriptions = new TreeMap<>();
        catalog.permissions().forEach(permission -> catalogDescriptions.put(permission.name(), permission.description()));
        Set<String> missingFromCatalog = new TreeSet<>(enumDescriptions.keySet());
        missingFromCatalog.removeAll(catalogDescriptions.keySet());
        Set<String> missingFromEnum = new TreeSet<>(catalogDescriptions.keySet());
        missingFromEnum.removeAll(enumDescriptions.keySet());
        List<String> descriptionDifferences = enumDescriptions.entrySet().stream()
                .filter(entry -> catalogDescriptions.containsKey(entry.getKey())
                        && !entry.getValue().equals(catalogDescriptions.get(entry.getKey())))
                .map(entry -> entry.getKey() + " (PermissionCode='" + entry.getValue() + "', YAML='"
                        + catalogDescriptions.get(entry.getKey()) + "')")
                .toList();
        if (!missingFromCatalog.isEmpty() || !missingFromEnum.isEmpty() || !descriptionDifferences.isEmpty()) {
            throw new CatalogValidationException("El enum PermissionCode y el catálogo YAML no coinciden: "
                    + "faltan en YAML=" + missingFromCatalog + ", faltan en PermissionCode=" + missingFromEnum
                    + ", descripciones distintas=" + descriptionDifferences + ".");
        }
    }

    private List<Permission> checkEndpointsAgainstDatabase(List<EndpointPermission> endpoints) {
        List<Permission> activePermissions = permissionRepository.findByDeletedAtIsNullOrderByNameAsc();
        Set<String> activePermissionNames = activePermissions.stream()
                .map(Permission::getName)
                .collect(java.util.stream.Collectors.toSet());
        for (EndpointPermission endpoint : endpoints) {
            if (!activePermissionNames.contains(endpoint.permissionCode().name())) {
                throw new CatalogValidationException("El permiso '" + endpoint.permissionCode().name()
                        + "' requerido por el endpoint " + endpoint.describe() + " no existe activo en la BD.");
            }
        }
        return activePermissions;
    }

    private void warnAboutCatalogPermissionsWithoutEndpoint(RolePermissionCatalog catalog,
            List<EndpointPermission> endpoints) {
        Set<String> endpointPermissions = endpoints.stream()
                .map(endpoint -> endpoint.permissionCode().name())
                .collect(java.util.stream.Collectors.toSet());
        catalog.permissions().stream()
                .map(permission -> permission.name())
                .filter(permissionName -> !endpointPermissions.contains(permissionName))
                .sorted()
                .forEach(permissionName -> log.warn("El permiso YAML '{}' no está asociado a ningún endpoint.",
                        permissionName));
    }

    private void warnAboutDatabasePermissionsWithoutEndpoint(List<Permission> activePermissions,
            List<EndpointPermission> endpoints) {
        Set<String> endpointPermissions = endpoints.stream()
                .map(endpoint -> endpoint.permissionCode().name())
                .collect(java.util.stream.Collectors.toSet());
        activePermissions.stream()
                .map(Permission::getName)
                .filter(permissionName -> !endpointPermissions.contains(permissionName))
                .sorted()
                .forEach(permissionName -> log.warn("El permiso activo en BD '{}' no está asociado a ningún endpoint.",
                        permissionName));
    }

    private void warnAboutPermissionsWithoutActiveRole(List<Permission> activePermissions) {
        Set<String> assignedPermissionNames = new HashSet<>(
                rolePermissionRepository.findActivePermissionNamesAssignedToActiveRoles());
        activePermissions.stream()
                .map(Permission::getName)
                .filter(permissionName -> !assignedPermissionNames.contains(permissionName))
                .forEach(permissionName -> log.warn("El permiso activo en BD '{}' no está asignado a ningún rol activo.",
                        permissionName));
    }

    private Map<String, Long> permissionCountsByFile(RolePermissionCatalog catalog) {
        Map<String, Long> countsByFile = new TreeMap<>();
        catalog.permissions().forEach(permission -> countsByFile.merge(
                permission.nameSource().file(), 1L, Long::sum));
        return countsByFile;
    }

    public record EndpointPermission(String httpMethod, String path, String endpoint, PermissionCode permissionCode) {
        public String describe() {
            return httpMethod + " " + path + " (" + endpoint + ")";
        }
    }
}
