package es.bancosol.api.roles;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import es.bancosol.api.auth.service.PermissionChangeTracker;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.entity.Role;
import es.bancosol.api.roles.entity.RolePermission;
import es.bancosol.api.roles.repository.PermissionRepository;
import es.bancosol.api.roles.repository.RolePermissionRepository;
import es.bancosol.api.roles.repository.RoleRepository;
import es.bancosol.api.roles.service.CatalogValidationException;
import es.bancosol.api.roles.service.PermissionCatalogSynchronizer;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = "roles-and-permission-sync=FORCE")
@Transactional
class PermissionCatalogIntegrationTests {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @Autowired
    private PermissionCatalogSynchronizer permissionCatalogSynchronizer;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @BeforeEach
    void useForceModeByDefault() {
        setSyncMode("FORCE");
    }

    @AfterEach
    void clearPermissionChange() {
        redisTemplate.delete(PermissionChangeTracker.LAST_CHANGE_KEY);
    }

    @Test
    void createsEveryPermissionFromTheApplicationCatalog() {
        Arrays.stream(PermissionCode.values()).forEach(permissionCode -> {
            Permission permission = permissionRepository.findByName(permissionCode.name()).orElseThrow();

            assertThat(permission.getDescription()).isEqualTo(permissionCode.getDescription());
            assertThat(permission.getDeletedAt()).isNull();
        });
    }

    @Test
    void grantsExactlyTheCatalogPermissionsToTheInitialAdminRole() {
        String[] adminPermissions = jdbcTemplate.queryForList("""
                SELECT permissions.name
                FROM roles
                JOIN role_permissions ON role_permissions.role_id = roles.id
                JOIN permissions ON permissions.id = role_permissions.permission_id
                WHERE roles.name = 'ADMIN'
                  AND roles.deleted_at IS NULL
                  AND role_permissions.deleted_at IS NULL
                  AND permissions.deleted_at IS NULL
                """, String.class).toArray(String[]::new);

        assertThat(adminPermissions)
                .containsExactlyInAnyOrder(Arrays.stream(PermissionCode.values()).map(PermissionCode::name)
                        .toArray(String[]::new));
    }

    @Test
    void restoresCatalogPermissionRemovedFromAdminWhenSynchronizing() {
        Integer adminRoleId = jdbcTemplate.queryForObject(
                "SELECT id FROM roles WHERE name = 'ADMIN' AND deleted_at IS NULL", Integer.class);
        Integer permissionId = jdbcTemplate.queryForObject(
                "SELECT id FROM permissions WHERE name = ? AND deleted_at IS NULL",
                Integer.class,
                PermissionCode.ZONE_READ.name());
        jdbcTemplate.update("""
                UPDATE role_permissions
                SET deleted_at = NOW()
                WHERE role_id = ? AND permission_id = ? AND deleted_at IS NULL
                """, adminRoleId, permissionId);

        permissionCatalogSynchronizer.run(emptyArguments());

        Integer activeAssignments = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM role_permissions
                WHERE role_id = ? AND permission_id = ? AND deleted_at IS NULL
                """, Integer.class, adminRoleId, permissionId);
        assertThat(activeAssignments).isEqualTo(1);
    }

    @Test
    void reactivatesCatalogPermissionsAndRefreshesTheirDescriptions() {
        PermissionCode permissionCode = PermissionCode.ROLE_CREATE;
        Permission permission = permissionRepository.findByName(permissionCode.name()).orElseThrow();
        permission.setDeletedAt(Instant.now());
        permission.setDescription("Descripción antigua");
        permissionRepository.saveAndFlush(permission);

        permissionCatalogSynchronizer.run(emptyArguments());
        entityManager.clear();

        Permission synchronizedPermission = permissionRepository.findByName(permissionCode.name()).orElseThrow();
        assertThat(synchronizedPermission.getDeletedAt()).isNull();
        assertThat(synchronizedPermission.getDescription()).isEqualTo(permissionCode.getDescription());
    }

    @Test
    void softDeletesPermissionsNotDeclaredInTheCatalog() {
        String extraPermissionName = "PERMISSION_NOT_IN_CATALOG";
        permissionRepository.saveAndFlush(new Permission(extraPermissionName, "Permiso desconocido"));

        permissionCatalogSynchronizer.run(emptyArguments());
        entityManager.clear();

        assertThat(permissionRepository.findByName(extraPermissionName))
                .hasValueSatisfying(permission -> assertThat(permission.getDeletedAt()).isNotNull());
    }

    @Test
    void ifEmptyInitializesCatalogFromThePersistedUninitializedMarker() {
        jdbcTemplate.update("UPDATE role_permission_catalog_state SET initialized = FALSE WHERE id = 1");
        setSyncMode("IF_EMPTY");

        permissionCatalogSynchronizer.run(emptyArguments());

        assertThat(jdbcTemplate.queryForObject(
                "SELECT initialized FROM role_permission_catalog_state WHERE id = 1", Boolean.class)).isTrue();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM roles WHERE deleted_at IS NULL", Integer.class)).isEqualTo(5);
        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM permissions WHERE deleted_at IS NULL", Integer.class))
                .isEqualTo(PermissionCode.values().length);
    }

    @Test
    void ifEmptyPreservesRuntimeRolesAndAssignmentsAfterInitialization() {
        jdbcTemplate.update("UPDATE role_permission_catalog_state SET initialized = TRUE WHERE id = 1");
        setSyncMode("IF_EMPTY");
        Role runtimeRole = roleRepository.saveAndFlush(new Role("RUNTIME_ROLE"));
        Permission permission = permissionRepository.findByName(PermissionCode.ZONE_READ.name()).orElseThrow();
        rolePermissionRepository.saveAndFlush(new RolePermission(runtimeRole, permission));

        permissionCatalogSynchronizer.run(emptyArguments());
        entityManager.clear();

        assertThat(roleRepository.findByNameAndDeletedAtIsNull("RUNTIME_ROLE")).isPresent();
        assertThat(rolePermissionRepository.findByRole_IdAndPermission_IdAndDeletedAtIsNull(
                runtimeRole.getId(), permission.getId())).isPresent();
    }

    @Test
    void checkModeDoesNotWriteCatalogRowsOrInitializationState() {
        setSyncMode("CHECK");
        List<String> before = catalogSnapshot();

        permissionCatalogSynchronizer.run(emptyArguments());

        assertThat(catalogSnapshot()).isEqualTo(before);
    }

    @Test
    @ExtendWith(OutputCaptureExtension.class)
    void offSkipsGlobalCatalogComparisonAndReportsYamlWasNotLoaded(CapturedOutput output) {
        setSyncMode("OFF");
        roleRepository.saveAndFlush(new Role("RUNTIME_ROLE"));
        permissionRepository.saveAndFlush(new Permission("RUNTIME_PERMISSION", "Permiso creado en tiempo de ejecución"));

        permissionCatalogSynchronizer.run(emptyArguments());

        assertThat(output).contains("archivos YAML=no cargados");
        assertThat(permissionRepository.findByName("RUNTIME_PERMISSION")).isPresent();
    }

    @Test
    void offStillChecksEndpointPermissionsAgainstPostgres() {
        setSyncMode("OFF");
        Permission permission = permissionRepository.findByName(PermissionCode.USER_CREATE.name()).orElseThrow();
        permission.setDeletedAt(Instant.now());
        permissionRepository.saveAndFlush(permission);
        entityManager.clear();

        assertThatThrownBy(() -> permissionCatalogSynchronizer.run(emptyArguments()))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("USER_CREATE")
                .hasMessageContaining("POST /users")
                .hasMessageContaining("UserController#create")
                .hasMessageContaining("no existe activo en la BD");
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void concurrentPostgresSynchronizationsLeaveOneConsistentCatalog() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try {
            Future<?> firstRun = executor.submit(() -> runWhenReleased(ready, start));
            Future<?> secondRun = executor.submit(() -> runWhenReleased(ready, start));

            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            firstRun.get(60, TimeUnit.SECONDS);
            secondRun.get(60, TimeUnit.SECONDS);

            assertThat(jdbcTemplate.queryForObject("SELECT initialized FROM role_permission_catalog_state WHERE id = 1",
                    Boolean.class)).isTrue();
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT COUNT(*) FROM (
                        SELECT name FROM permissions WHERE deleted_at IS NULL GROUP BY name HAVING COUNT(*) > 1
                    ) duplicates
                    """, Integer.class)).isZero();
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT COUNT(*) FROM (
                        SELECT name FROM roles WHERE deleted_at IS NULL GROUP BY name HAVING COUNT(*) > 1
                    ) duplicates
                    """, Integer.class)).isZero();
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT COUNT(*) FROM (
                        SELECT role_id, permission_id FROM role_permissions WHERE deleted_at IS NULL
                        GROUP BY role_id, permission_id HAVING COUNT(*) > 1
                    ) duplicates
                    """, Integer.class)).isZero();
            assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM permissions WHERE deleted_at IS NULL",
                    Integer.class)).isEqualTo(PermissionCode.values().length);
            assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM roles WHERE deleted_at IS NULL",
                    Integer.class)).isEqualTo(5);
            assertThat(jdbcTemplate.queryForObject("""
                    SELECT COUNT(*) FROM role_permissions
                    JOIN roles ON roles.id = role_permissions.role_id
                    JOIN permissions ON permissions.id = role_permissions.permission_id
                    WHERE role_permissions.deleted_at IS NULL AND roles.deleted_at IS NULL
                        AND permissions.deleted_at IS NULL
                    """, Integer.class)).isEqualTo(PermissionCode.values().length);
        } finally {
            start.countDown();
            executor.shutdownNow();
            executor.awaitTermination(10, TimeUnit.SECONDS);
        }
    }

    private void runWhenReleased(CountDownLatch ready, CountDownLatch start) {
        ready.countDown();
        try {
            if (!start.await(10, TimeUnit.SECONDS)) {
                throw new IllegalStateException("Timed out waiting to start concurrent catalog synchronization");
            }
            permissionCatalogSynchronizer.run(emptyArguments());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Concurrent catalog synchronization was interrupted", exception);
        }
    }

    private List<String> catalogSnapshot() {
        List<String> snapshot = jdbcTemplate.queryForList("""
                SELECT 'permission:' || name || ':' || description || ':' || COALESCE(deleted_at::text, '')
                    || ':' || updated_at::text AS row_value
                FROM permissions
                UNION ALL
                SELECT 'role:' || name || ':' || COALESCE(deleted_at::text, '') || ':' || updated_at::text
                FROM roles
                UNION ALL
                SELECT 'assignment:' || roles.name || ':' || permissions.name || ':'
                    || COALESCE(role_permissions.deleted_at::text, '') || ':' || role_permissions.updated_at::text
                FROM role_permissions
                JOIN roles ON roles.id = role_permissions.role_id
                JOIN permissions ON permissions.id = role_permissions.permission_id
                UNION ALL
                SELECT 'membership:' || user_roles.user_id::text || ':' || roles.name || ':'
                    || COALESCE(user_roles.deleted_at::text, '') || ':' || user_roles.updated_at::text
                FROM user_roles
                JOIN roles ON roles.id = user_roles.role_id
                ORDER BY row_value
                """, String.class);
        snapshot.add("initialized:" + jdbcTemplate.queryForObject(
                "SELECT initialized::text FROM role_permission_catalog_state WHERE id = 1", String.class));
        return snapshot;
    }

    private void setSyncMode(String syncMode) {
        ReflectionTestUtils.setField(permissionCatalogSynchronizer, "syncMode", syncMode);
    }

    private ApplicationArguments emptyArguments() {
        return new DefaultApplicationArguments(new String[0]);
    }
}
