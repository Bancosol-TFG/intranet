package es.bancosol.api.common.security;

import java.util.Arrays;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

public class WithAllPermissionsSecurityContextFactory implements WithSecurityContextFactory<WithAllPermissions> {
    @Override
    public SecurityContext createSecurityContext(WithAllPermissions annotation) {
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                "integration-test",
                "unused",
                Arrays.stream(PermissionCode.values())
                        .map(permissionCode -> new SimpleGrantedAuthority(permissionCode.name()))
                        .toList()));
        return securityContext;
    }
}
