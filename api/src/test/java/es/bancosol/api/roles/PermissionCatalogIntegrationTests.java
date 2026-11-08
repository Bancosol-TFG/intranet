package es.bancosol.api.roles;

import java.time.Instant;
import java.util.Arrays;
import es.bancosol.api.auth.service.PermissionChangeTracker;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.repository.PermissionRepository;
import es.bancosol.api.roles.service.PermissionCatalogSynchronizer;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "roles-and-permission-sync=FORCE")
@Transactional
class PermissionCatalogIntegrationTests {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private PermissionCatalogSynchronizer permissionCatalogSynchronizer;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

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

    private ApplicationArguments emptyArguments() {
        return new DefaultApplicationArguments(new String[0]);
    }
}
