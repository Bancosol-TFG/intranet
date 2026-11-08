package es.bancosol.api.roles.service;

import java.util.List;
import java.util.Set;
import es.bancosol.api.roles.dto.CatalogPermission;
import es.bancosol.api.roles.dto.CatalogPermissionReference;
import es.bancosol.api.roles.dto.CatalogRole;
import es.bancosol.api.roles.dto.CatalogSource;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import es.bancosol.api.roles.repository.RolePermissionCatalogRepository;
import es.bancosol.api.roles.repository.RolePermissionCatalogRepository.ActivePermission;
import es.bancosol.api.roles.repository.RolePermissionCatalogRepository.ActiveRolePermissionAssignment;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RolePermissionCatalogDatabaseCheckerTests {
    private static final CatalogSource SOURCE = new CatalogSource("catalog.yaml", 1, "name");

    @Test
    void acceptsMatchingPermissionsRolesAndAssignments() {
        RolePermissionCatalog catalog = catalog(
                List.of("READ", "WRITE"),
                List.of(role("ADMIN", "READ", "WRITE"), role("VIEWER", "READ")));
        RolePermissionCatalogDatabaseChecker checker = checker(
                permissions("WRITE", "READ"), List.of("VIEWER", "ADMIN"),
                Set.of(new Assignment("ADMIN", "READ"), new Assignment("ADMIN", "WRITE"),
                        new Assignment("VIEWER", "READ")));

        assertThatCode(() -> checker.checkPermissions(catalog)).doesNotThrowAnyException();
        assertThatCode(() -> checker.checkRoles(catalog)).doesNotThrowAnyException();
    }

    @Test
    void reportsPermissionNamesMissingAndExtraInDatabaseInSortedOrder() {
        RolePermissionCatalog catalog = catalog(List.of("CATALOG_B", "CATALOG_A"), List.of());
        RolePermissionCatalogDatabaseChecker checker = checker(
                permissions("DATABASE_Z", "CATALOG_B", "DATABASE_A"), List.of(), Set.of());

        assertThatThrownBy(() -> checker.checkPermissions(catalog))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessage("El catálogo YAML y la BD no coinciden en permisos: "
                        + "faltan en BD=[CATALOG_A], sobran en BD=[DATABASE_A, DATABASE_Z], "
                        + "descripciones distintas en BD=[].");
    }

    @Test
    void reportsDifferentPermissionDescriptionsWithBothValues() {
        RolePermissionCatalog catalog = catalogWithPermissions(List.of(
                new CatalogPermission("WRITE", "Modificar recurso", SOURCE, SOURCE),
                new CatalogPermission("READ", "Consultar recurso", SOURCE, SOURCE)), List.of());
        RolePermissionCatalogDatabaseChecker checker = checker(
                List.of(new PermissionDetails("WRITE", "Cambiar recurso"),
                        new PermissionDetails("READ", "Leer recurso")),
                List.of(), Set.of());

        assertThatThrownBy(() -> checker.checkPermissions(catalog))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessage("El catálogo YAML y la BD no coinciden en permisos: "
                        + "faltan en BD=[], sobran en BD=[], "
                        + "descripciones distintas en BD=[READ (YAML='Consultar recurso', BD='Leer recurso'), "
                        + "WRITE (YAML='Modificar recurso', BD='Cambiar recurso')].");
    }

    @Test
    void reportsRoleAndAssignmentDifferencesInSortedOrder() {
        RolePermissionCatalog catalog = catalog(List.of("READ"), List.of(
                role("ADMIN", "READ"), role("VOLUNTEER")));
        RolePermissionCatalogDatabaseChecker checker = checker(
                permissions("READ"), List.of("LEGACY", "ADMIN"),
                Set.of(new Assignment("LEGACY", "LEGACY_PERMISSION"), new Assignment("ADMIN", "WRITE")));

        assertThatThrownBy(() -> checker.checkRoles(catalog))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessage("El catálogo YAML y la BD no coinciden en roles y asignaciones: "
                        + "faltan roles en BD=[VOLUNTEER], sobran roles en BD=[LEGACY], "
                        + "faltan asignaciones en BD=[ADMIN -> READ], "
                        + "sobran asignaciones en BD=[ADMIN -> WRITE, LEGACY -> LEGACY_PERMISSION].");
    }

    private RolePermissionCatalogDatabaseChecker checker(List<PermissionDetails> databasePermissions,
            List<String> databaseRoles, Set<Assignment> databaseAssignments) {
        RolePermissionCatalogRepository rolePermissionCatalogRepository =
                mock(RolePermissionCatalogRepository.class);
        when(rolePermissionCatalogRepository.findActivePermissions()).thenReturn(databasePermissions.stream()
                .map(permission -> new ActivePermission(permission.name(), permission.description()))
                .toList());
        when(rolePermissionCatalogRepository.findActiveRoleNames()).thenReturn(databaseRoles);
        when(rolePermissionCatalogRepository.findActiveRolePermissionAssignments())
                .thenReturn(databaseAssignments.stream()
                        .map(assignment -> new ActiveRolePermissionAssignment(
                                assignment.roleName(), assignment.permissionName()))
                        .toList());
        return new RolePermissionCatalogDatabaseChecker(rolePermissionCatalogRepository);
    }

    private RolePermissionCatalog catalog(List<String> permissions, List<CatalogRole> roles) {
        return new RolePermissionCatalog(
                permissions.stream()
                        .map(name -> new CatalogPermission(name, "description", SOURCE, SOURCE))
                        .toList(),
                roles);
    }

    private RolePermissionCatalog catalogWithPermissions(
            List<CatalogPermission> permissions, List<CatalogRole> roles) {
        return new RolePermissionCatalog(permissions, roles);
    }

    private List<PermissionDetails> permissions(String... names) {
        return java.util.Arrays.stream(names)
                .map(name -> new PermissionDetails(name, "description"))
                .toList();
    }

    private CatalogRole role(String name, String... permissions) {
        return new CatalogRole(name,
                java.util.Arrays.stream(permissions)
                        .map(permission -> new CatalogPermissionReference(permission, SOURCE))
                        .toList(),
                SOURCE);
    }

    private record Assignment(String roleName, String permissionName) {
    }

    private record PermissionDetails(String name, String description) {
    }
}
