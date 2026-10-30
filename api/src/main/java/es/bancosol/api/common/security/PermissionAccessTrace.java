package es.bancosol.api.common.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PermissionAccessTrace {
    private static final Logger LOGGER = LoggerFactory.getLogger(PermissionAccessTrace.class);

    public void recordAllowedAccess(PermissionCode permissionCode, String endpoint) {
        LOGGER.info("Permission access granted: permission={}, endpoint={}", permissionCode, endpoint);
    }

    public void recordDeniedAccess(PermissionCode permissionCode, String endpoint) {
        LOGGER.warn("Permission access denied: permission={}, endpoint={}", permissionCode, endpoint);
    }
}