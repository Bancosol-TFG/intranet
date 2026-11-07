package es.bancosol.api.roles.controller;

import java.util.List;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.common.security.RequiresPermission;
import es.bancosol.api.roles.dto.PermissionResponse;
import es.bancosol.api.roles.dto.RoleRequest;
import es.bancosol.api.roles.dto.RoleResponse;
import es.bancosol.api.roles.service.RolePermissionService;
import es.bancosol.api.roles.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;
    private final RolePermissionService rolePermissionService;

    @GetMapping
    @RequiresPermission(PermissionCode.ROLE_LIST)
    public PagedModel<RoleResponse> list(Pageable pageable) {
        return new PagedModel<>(roleService.list(pageable));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @RequiresPermission(PermissionCode.ROLE_CREATE)
    public RoleResponse create(@Valid @RequestBody RoleRequest request) {
        return roleService.create(request);
    }

    @GetMapping("/{roleId}/permissions")
    @RequiresPermission(PermissionCode.ROLE_PERMISSION_LIST)
    public List<PermissionResponse> listPermissions(@PathVariable Integer roleId) {
        return rolePermissionService.list(roleId);
    }

    @PutMapping("/{roleId}/permissions/{permissionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @RequiresPermission(PermissionCode.ROLE_PERMISSION_ASSIGN)
    public void assignPermission(@PathVariable Integer roleId, @PathVariable Integer permissionId) {
        rolePermissionService.assign(roleId, permissionId);
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @RequiresPermission(PermissionCode.ROLE_PERMISSION_REVOKE)
    public void revokePermission(@PathVariable Integer roleId, @PathVariable Integer permissionId) {
        rolePermissionService.revoke(roleId, permissionId);
    }
}
