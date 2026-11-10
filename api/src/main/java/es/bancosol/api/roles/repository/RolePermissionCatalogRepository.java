package es.bancosol.api.roles.repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import es.bancosol.api.roles.dto.CatalogPermission;
import es.bancosol.api.roles.dto.CatalogRole;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Repository;

@Repository
public class RolePermissionCatalogRepository {
    private static final long ADVISORY_LOCK_KEY = 5928230121198289997L;
    private static final String MISSING_CATALOG_STATE_MESSAGE = "No se encontró la fila del marcador del catálogo de "
            + "roles y permisos (id = 1). Aplica la migración Flyway del catálogo antes de iniciar la API.";

    private final JdbcTemplate jdbcTemplate;

    public RolePermissionCatalogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ActivePermission> findActivePermissions() {
        return jdbcTemplate.query(
                "SELECT name, description FROM permissions WHERE deleted_at IS NULL",
                (resultSet, rowNumber) -> new ActivePermission(
                        resultSet.getString("name"), resultSet.getString("description")));
    }

    public List<String> findActiveRoleNames() {
        return jdbcTemplate.query(
                "SELECT name FROM roles WHERE deleted_at IS NULL",
                (resultSet, rowNumber) -> resultSet.getString("name"));
    }

    public List<ActiveRolePermissionAssignment> findActiveRolePermissionAssignments() {
        return jdbcTemplate.query(
                "SELECT roles.name AS role_name, permissions.name AS permission_name "
                        + "FROM role_permissions "
                        + "JOIN roles ON roles.id = role_permissions.role_id "
                        + "JOIN permissions ON permissions.id = role_permissions.permission_id "
                        + "WHERE role_permissions.deleted_at IS NULL "
                        + "AND roles.deleted_at IS NULL AND permissions.deleted_at IS NULL",
                (resultSet, rowNumber) -> new ActiveRolePermissionAssignment(
                        resultSet.getString("role_name"), resultSet.getString("permission_name")));
    }

    public void acquireAdvisoryLock() {
        jdbcTemplate.query("SELECT pg_advisory_xact_lock(?)", (ResultSetExtractor<Void>) resultSet -> {
            resultSet.next();
            return null;
        }, ADVISORY_LOCK_KEY);
    }

    public boolean isInitialized() {
        List<Boolean> initializedStates = jdbcTemplate.query(
                "SELECT initialized FROM role_permission_catalog_state WHERE id = 1 FOR UPDATE",
                (resultSet, rowNumber) -> resultSet.getBoolean("initialized"));
        if (initializedStates.isEmpty()) {
            throw new IllegalStateException(MISSING_CATALOG_STATE_MESSAGE);
        }
        return initializedStates.getFirst();
    }

    public void markInitialized() {
        int updatedRows = jdbcTemplate.update(
                "UPDATE role_permission_catalog_state SET initialized = TRUE WHERE id = 1 AND initialized = FALSE");
        if (updatedRows == 0 && !isInitialized()) {
            throw new IllegalStateException("No se pudo marcar como inicializado el catálogo de roles y permisos.");
        }
    }

    public boolean initializeCatalog(RolePermissionCatalog catalog) {
        boolean changed = false;
        Map<String, Integer> permissionIds = new HashMap<>();
        for (CatalogPermission permission : catalog.permissions()) {
            UpsertResult result = upsertPermission(permission);
            permissionIds.put(permission.name(), result.id());
            changed |= result.changed();
        }

        Map<String, Integer> roleIds = new HashMap<>();
        for (CatalogRole role : catalog.roles()) {
            UpsertResult result = upsertRole(role.name());
            roleIds.put(role.name(), result.id());
            changed |= result.changed();
        }

        for (CatalogRole role : catalog.roles()) {
            int roleId = roleIds.get(role.name());
            for (var permission : role.permissions()) {
                UpsertResult result = upsertRolePermission(roleId, permissionIds.get(permission.name()));
                changed |= result.changed();
            }
        }
        return changed;
    }

    public boolean reconcileCatalog(RolePermissionCatalog catalog) {
        boolean changed = initializeCatalog(catalog);
        Map<String, Integer> permissionIds = findActivePermissionIds(catalog);
        Map<String, Integer> roleIds = findActiveRoleIds(catalog);
        Set<AssociationKey> desiredAssignments = findDesiredAssignments(catalog, permissionIds, roleIds);

        changed |= softDeleteUndeclaredAssignments(desiredAssignments);
        changed |= softDeleteMembershipsForUndeclaredRoles(catalog);
        changed |= softDeleteUndeclaredRows("permissions", catalog.permissions().stream()
                .map(CatalogPermission::name).toList());
        changed |= softDeleteUndeclaredRows("roles", catalog.roles().stream().map(CatalogRole::name).toList());
        return changed;
    }

    private UpsertResult upsertPermission(CatalogPermission permission) {
        List<PermissionRow> activeRows = jdbcTemplate.query(
                "SELECT id, description FROM permissions WHERE name = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1",
                (resultSet, rowNumber) -> new PermissionRow(resultSet.getInt("id"), resultSet.getString("description")),
                permission.name());
        if (!activeRows.isEmpty()) {
            PermissionRow activeRow = activeRows.getFirst();
            if (Objects.equals(activeRow.description(), permission.description())) {
                return new UpsertResult(activeRow.id(), false);
            }
            jdbcTemplate.update("UPDATE permissions SET description = ?, updated_at = NOW() WHERE id = ?",
                    permission.description(), activeRow.id());
            return new UpsertResult(activeRow.id(), true);
        }

        List<Integer> deletedIds = jdbcTemplate.query(
                "SELECT id FROM permissions WHERE name = ? AND deleted_at IS NOT NULL ORDER BY id DESC LIMIT 1",
                (resultSet, rowNumber) -> resultSet.getInt("id"), permission.name());
        if (!deletedIds.isEmpty()) {
            int deletedId = deletedIds.getFirst();
            jdbcTemplate.update("UPDATE permissions SET description = ?, deleted_at = NULL, updated_at = NOW() WHERE id = ?",
                    permission.description(), deletedId);
            return new UpsertResult(deletedId, true);
        }

        int insertedId = jdbcTemplate.queryForObject(
                "INSERT INTO permissions (name, description) VALUES (?, ?) RETURNING id",
                Integer.class, permission.name(), permission.description());
        return new UpsertResult(insertedId, true);
    }

    private UpsertResult upsertRole(String name) {
        List<Integer> activeIds = jdbcTemplate.query(
                "SELECT id FROM roles WHERE name = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1",
                (resultSet, rowNumber) -> resultSet.getInt("id"), name);
        if (!activeIds.isEmpty()) {
            return new UpsertResult(activeIds.getFirst(), false);
        }

        List<Integer> deletedIds = jdbcTemplate.query(
                "SELECT id FROM roles WHERE name = ? AND deleted_at IS NOT NULL ORDER BY id DESC LIMIT 1",
                (resultSet, rowNumber) -> resultSet.getInt("id"), name);
        if (!deletedIds.isEmpty()) {
            int deletedId = deletedIds.getFirst();
            jdbcTemplate.update("UPDATE roles SET deleted_at = NULL, updated_at = NOW() WHERE id = ?", deletedId);
            return new UpsertResult(deletedId, true);
        }

        int insertedId = jdbcTemplate.queryForObject("INSERT INTO roles (name) VALUES (?) RETURNING id",
                Integer.class, name);
        return new UpsertResult(insertedId, true);
    }

    private UpsertResult upsertRolePermission(int roleId, int permissionId) {
        List<Integer> activeIds = jdbcTemplate.query(
                "SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? AND deleted_at IS NULL "
                        + "ORDER BY id DESC LIMIT 1",
                (resultSet, rowNumber) -> resultSet.getInt("id"), roleId, permissionId);
        if (!activeIds.isEmpty()) {
            return new UpsertResult(activeIds.getFirst(), false);
        }

        List<Integer> deletedIds = jdbcTemplate.query(
                "SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? AND deleted_at IS NOT NULL "
                        + "ORDER BY id DESC LIMIT 1",
                (resultSet, rowNumber) -> resultSet.getInt("id"), roleId, permissionId);
        if (!deletedIds.isEmpty()) {
            int deletedId = deletedIds.getFirst();
            jdbcTemplate.update("UPDATE role_permissions SET deleted_at = NULL, updated_at = NOW() WHERE id = ?",
                    deletedId);
            return new UpsertResult(deletedId, true);
        }

        int insertedId = jdbcTemplate.queryForObject(
                "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?) RETURNING id",
                Integer.class, roleId, permissionId);
        return new UpsertResult(insertedId, true);
    }

    private Map<String, Integer> findActivePermissionIds(RolePermissionCatalog catalog) {
        Map<String, Integer> permissionIds = new HashMap<>();
        for (CatalogPermission permission : catalog.permissions()) {
            permissionIds.put(permission.name(), findActiveId("permissions", permission.name()));
        }
        return permissionIds;
    }

    private Map<String, Integer> findActiveRoleIds(RolePermissionCatalog catalog) {
        Map<String, Integer> roleIds = new HashMap<>();
        for (CatalogRole role : catalog.roles()) {
            roleIds.put(role.name(), findActiveId("roles", role.name()));
        }
        return roleIds;
    }

    private int findActiveId(String tableName, String name) {
        List<Integer> ids = jdbcTemplate.query(
                "SELECT id FROM " + tableName + " WHERE name = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1",
                (resultSet, rowNumber) -> resultSet.getInt("id"), name);
        if (ids.isEmpty()) {
            throw new IllegalStateException("No se encontró una fila activa del catálogo para el nombre '" + name + "'.");
        }
        return ids.getFirst();
    }

    private Set<AssociationKey> findDesiredAssignments(RolePermissionCatalog catalog,
            Map<String, Integer> permissionIds, Map<String, Integer> roleIds) {
        Set<AssociationKey> desiredAssignments = new HashSet<>();
        for (CatalogRole role : catalog.roles()) {
            int roleId = roleIds.get(role.name());
            for (var permission : role.permissions()) {
                desiredAssignments.add(new AssociationKey(roleId, permissionIds.get(permission.name())));
            }
        }
        return desiredAssignments;
    }

    private boolean softDeleteUndeclaredAssignments(Set<AssociationKey> desiredAssignments) {
        List<ActiveAssignment> activeAssignments = jdbcTemplate.query(
                "SELECT id, role_id, permission_id FROM role_permissions WHERE deleted_at IS NULL",
                (resultSet, rowNumber) -> new ActiveAssignment(resultSet.getInt("id"),
                        resultSet.getInt("role_id"), resultSet.getInt("permission_id")));
        boolean changed = false;
        for (ActiveAssignment assignment : activeAssignments) {
            if (!desiredAssignments.contains(new AssociationKey(assignment.roleId(), assignment.permissionId()))) {
                int updatedRows = jdbcTemplate.update("UPDATE role_permissions SET deleted_at = NOW(), updated_at = NOW() "
                        + "WHERE id = ? AND deleted_at IS NULL", assignment.id());
                changed |= updatedRows > 0;
            }
        }
        return changed;
    }

    private boolean softDeleteMembershipsForUndeclaredRoles(RolePermissionCatalog catalog) {
        List<String> declaredRoleNames = catalog.roles().stream().map(CatalogRole::name).toList();
        String sql = "SELECT id FROM roles WHERE TRUE" + undeclaredNamePredicate(declaredRoleNames);
        List<Integer> undeclaredRoleIds = jdbcTemplate.query(sql,
                (resultSet, rowNumber) -> resultSet.getInt("id"), declaredRoleNames.toArray());
        if (undeclaredRoleIds.isEmpty()) {
            return false;
        }

        String placeholders = placeholders(undeclaredRoleIds.size());
        int updatedRows = jdbcTemplate.update("UPDATE user_roles SET deleted_at = NOW(), updated_at = NOW() "
                + "WHERE deleted_at IS NULL AND role_id IN (" + placeholders + ")", undeclaredRoleIds.toArray());
        return updatedRows > 0;
    }

    private boolean softDeleteUndeclaredRows(String tableName, List<String> declaredNames) {
        String sql = "UPDATE " + tableName + " SET deleted_at = NOW(), updated_at = NOW() "
                + "WHERE deleted_at IS NULL" + undeclaredNamePredicate(declaredNames);
        return jdbcTemplate.update(sql, declaredNames.toArray()) > 0;
    }

    private String undeclaredNamePredicate(List<String> declaredNames) {
        if (declaredNames.isEmpty()) {
            return "";
        }
        return " AND name NOT IN (" + placeholders(declaredNames.size()) + ")";
    }

    private String placeholders(int count) {
        List<String> placeholders = new ArrayList<>(count);
        for (int index = 0; index < count; index++) {
            placeholders.add("?");
        }
        return String.join(", ", placeholders);
    }

    private record PermissionRow(int id, String description) {
    }

    private record UpsertResult(int id, boolean changed) {
    }

    private record AssociationKey(int roleId, int permissionId) {
    }

    private record ActiveAssignment(int id, int roleId, int permissionId) {
    }

    public record ActivePermission(String name, String description) {
    }

    public record ActiveRolePermissionAssignment(String roleName, String permissionName) {
    }
}
