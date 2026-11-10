package es.bancosol.api.roles.service;

import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import es.bancosol.api.roles.dto.CatalogPermission;
import es.bancosol.api.roles.dto.CatalogPermissionReference;
import es.bancosol.api.roles.dto.CatalogRole;
import es.bancosol.api.roles.dto.CatalogSource;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import es.bancosol.api.roles.repository.RolePermissionCatalogRepository;
import es.bancosol.api.roles.repository.RolePermissionCatalogRepository.ActivePermission;
import es.bancosol.api.roles.repository.RolePermissionCatalogRepository.ActiveRolePermissionAssignment;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.startsWith;

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

    @Test
    void forceSoftDeletesMembershipsForUndeclaredRoles() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        when(jdbcTemplate.query(anyString(), any(RowMapper.class), any(Object[].class)))
                .thenAnswer(invocation -> invocation.<String>getArgument(0).equals("SELECT id FROM roles WHERE TRUE")
                        ? List.of(42)
                        : List.of());
        doAnswer(invocation -> invocation.<String>getArgument(0).startsWith("UPDATE user_roles") ? 1 : 0)
                .when(jdbcTemplate).update(anyString(), any(Object[].class));
        RolePermissionCatalogRepository repository = new RolePermissionCatalogRepository(jdbcTemplate);

        boolean changed = repository.reconcileCatalog(new RolePermissionCatalog(List.of(), List.of()));

        assertThat(changed).isTrue();
        verify(jdbcTemplate).update(eq("UPDATE user_roles SET deleted_at = NOW(), updated_at = NOW() "
                + "WHERE deleted_at IS NULL AND role_id IN (?)"), any(Object[].class));
    }

    @Test
    void forceReactivatesDeclaredRoleWithoutRestoringItsMemberships() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        AtomicInteger activeRoleLookups = new AtomicInteger();
        when(jdbcTemplate.query(anyString(), any(RowMapper.class), any(Object[].class)))
                .thenAnswer(invocation -> {
                    String sql = invocation.getArgument(0);
                    if (sql.equals("SELECT id FROM roles WHERE name = ? AND deleted_at IS NULL "
                            + "ORDER BY id DESC LIMIT 1")) {
                        return activeRoleLookups.getAndIncrement() == 0 ? List.of() : List.of(42);
                    }
                    if (sql.equals("SELECT id FROM roles WHERE name = ? AND deleted_at IS NOT NULL "
                            + "ORDER BY id DESC LIMIT 1")) {
                        return List.of(42);
                    }
                    return List.of();
                });
        doAnswer(invocation -> 0).when(jdbcTemplate).update(anyString(), any(Object[].class));
        RolePermissionCatalogRepository repository = new RolePermissionCatalogRepository(jdbcTemplate);
        RolePermissionCatalog catalog = new RolePermissionCatalog(List.of(), List.of(role("ADMIN")));

        boolean changed = repository.reconcileCatalog(catalog);

        assertThat(changed).isTrue();
        verify(jdbcTemplate).update(eq("UPDATE roles SET deleted_at = NULL, updated_at = NOW() WHERE id = ?"),
                any(Object[].class));
        verify(jdbcTemplate, never()).update(startsWith("UPDATE user_roles"), any(Object[].class));
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
