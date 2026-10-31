package es.bancosol.api.common.security;

import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j 
public class PermissionAccessTrace {

    public void recordAllowedAccess(PermissionCode permissionCode, String endpoint) {
        log.info("Permission access granted: permission={}, endpoint={}", permissionCode, endpoint);
    }

    public void recordDeniedAccess(PermissionCode permissionCode, String endpoint) {
        log.warn("Permission access denied: permission={}, endpoint={}", permissionCode, endpoint);
    }
}
