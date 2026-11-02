package es.bancosol.api.roles.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import es.bancosol.api.auth.service.PermissionChangeTracker;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.entity.Role;
import es.bancosol.api.roles.entity.RolePermission;
import es.bancosol.api.roles.repository.PermissionRepository;
import es.bancosol.api.roles.repository.RoleRepository;
import es.bancosol.api.roles.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionCatalogSynchronizer implements ApplicationRunner {
    private static final String ADMIN_ROLE_NAME = "ADMIN";

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionChangeTracker permissionChangeTracker;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Map<String, Permission> existingPermissions = new HashMap<>();
        permissionRepository.findAll().forEach(permission -> existingPermissions.put(permission.getName(), permission));

        Set<String> catalogNames = new HashSet<>();
        Arrays.stream(PermissionCode.values()).forEach(permissionCode -> {
            String permissionName = permissionCode.name();
            catalogNames.add(permissionName);
            Permission permission = existingPermissions.get(permissionName);

            if (permission == null) {
                permission = permissionRepository.save(new Permission(permissionName, permissionCode.getDescription()));
                existingPermissions.put(permissionName, permission);
                return;
            }

            boolean changed = false;
            if (!permissionCode.getDescription().equals(permission.getDescription())) {
                permission.setDescription(permissionCode.getDescription());
                changed = true;
            }
            if (permission.getDeletedAt() != null) {
                permission.setDeletedAt(null);
                changed = true;
            }
            if (changed) {
                permissionRepository.save(permission);
            }
        });

        roleRepository.findByNameAndDeletedAtIsNull(ADMIN_ROLE_NAME)
                .ifPresent(admin -> grantCatalogPermissions(admin, existingPermissions));

        existingPermissions.values().stream()
                .filter(permission -> !catalogNames.contains(permission.getName()))
                .forEach(permission -> log.warn("Database permission '{}' is not declared in PermissionCode.",
                        permission.getName()));
    }

    private void grantCatalogPermissions(Role admin, Map<String, Permission> catalogPermissions) {
        Map<Integer, RolePermission> activeAssignments = rolePermissionRepository
                .findByRole_IdAndDeletedAtIsNull(admin.getId()).stream()
                .collect(Collectors.toMap(assignment -> assignment.getPermission().getId(), Function.identity(),
                        (firstAssignment, ignoredAssignment) -> firstAssignment));
        Map<Integer, RolePermission> deletedAssignments = rolePermissionRepository
                .findByRole_IdAndDeletedAtIsNotNull(admin.getId()).stream()
                .collect(Collectors.toMap(assignment -> assignment.getPermission().getId(), Function.identity(),
                        (firstAssignment, ignoredAssignment) -> firstAssignment));

        List<RolePermission> missingAssignments = Arrays.stream(PermissionCode.values())
                .map(PermissionCode::name)
                .map(catalogPermissions::get)
                .filter(permission -> !activeAssignments.containsKey(permission.getId()))
                .map(permission -> restoreOrCreateAssignment(admin, permission, deletedAssignments))
                .toList();

        if (!missingAssignments.isEmpty()) {
            rolePermissionRepository.saveAllAndFlush(missingAssignments);
            permissionChangeTracker.markChanged();
        }
    }

    private RolePermission restoreOrCreateAssignment(
            Role admin,
            Permission permission,
            Map<Integer, RolePermission> deletedAssignments) {
        RolePermission assignment = deletedAssignments.get(permission.getId());
        if (assignment == null) {
            return new RolePermission(admin, permission);
        }

        assignment.setDeletedAt(null);
        return assignment;
    }
}
