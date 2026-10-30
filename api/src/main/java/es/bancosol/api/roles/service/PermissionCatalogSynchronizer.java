package es.bancosol.api.roles.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.repository.PermissionRepository;
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
    private final PermissionRepository permissionRepository;

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
                permissionRepository.save(new Permission(permissionName, permissionCode.getDescription()));
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

        existingPermissions.values().stream()
                .filter(permission -> !catalogNames.contains(permission.getName()))
                .forEach(permission -> log.warn("Database permission '{}' is not declared in PermissionCode.",
                        permission.getName()));
    }
}
