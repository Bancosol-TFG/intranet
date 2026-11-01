package es.bancosol.api.roles.service;

import java.time.Instant;
import java.util.List;
import es.bancosol.api.roles.dto.PermissionResponse;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.entity.Role;
import es.bancosol.api.roles.entity.RolePermission;
import es.bancosol.api.roles.repository.PermissionRepository;
import es.bancosol.api.roles.repository.RolePermissionRepository;
import es.bancosol.api.roles.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RolePermissionService {
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public List<PermissionResponse> list(Integer roleId) {
        findRole(roleId);
        return rolePermissionRepository
                .findByRole_IdAndDeletedAtIsNullAndPermission_DeletedAtIsNullOrderByPermission_NameAsc(roleId)
                .stream()
                .map(rolePermission -> PermissionResponse.from(rolePermission.getPermission()))
                .toList();
    }

    @Transactional
    public void assign(Integer roleId, Integer permissionId) {
        Role role = findRole(roleId);
        Permission permission = findPermission(permissionId);

        if (rolePermissionRepository
                .findByRole_IdAndPermission_IdAndDeletedAtIsNull(roleId, permissionId)
                .isPresent()) {
            return;
        }

        RolePermission previousAssignment = rolePermissionRepository
                .findByRole_IdAndPermission_IdAndDeletedAtIsNotNull(roleId, permissionId)
                .orElse(null);
        if (previousAssignment != null) {
            previousAssignment.setDeletedAt(null);
            rolePermissionRepository.saveAndFlush(previousAssignment);
            return;
        }

        rolePermissionRepository.saveAndFlush(new RolePermission(role, permission));
    }

    @Transactional
    public void revoke(Integer roleId, Integer permissionId) {
        findRole(roleId);
        findPermission(permissionId);
        rolePermissionRepository.findByRole_IdAndPermission_IdAndDeletedAtIsNull(roleId, permissionId)
                .ifPresent(rolePermission -> rolePermission.setDeletedAt(Instant.now()));
    }

    private Role findRole(Integer roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private Permission findPermission(Integer permissionId) {
        return permissionRepository.findByIdAndDeletedAtIsNull(permissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
