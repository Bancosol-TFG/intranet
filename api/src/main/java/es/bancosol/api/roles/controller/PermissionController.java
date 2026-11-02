package es.bancosol.api.roles.controller;

import java.util.List;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.common.security.RequiresPermission;
import es.bancosol.api.roles.dto.PermissionResponse;
import es.bancosol.api.roles.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @GetMapping
    @RequiresPermission(PermissionCode.PERMISSION_LIST)
    public List<PermissionResponse> list() {
        return permissionService.list();
    }
}
