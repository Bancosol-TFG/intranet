package es.bancosol.api.common.security;

import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class PermissionSecurityConfigurationTests {
    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void permitsAndTracesAuthenticationWithRequiredPermission() {
        PermissionAccessTrace permissionAccessTrace = mock(PermissionAccessTrace.class);

        try (AnnotationConfigApplicationContext context = createContext(permissionAccessTrace)) {
            SecurityContextHolder.getContext().setAuthentication(authenticationWith("ZONE_READ"));

            String result = context.getBean(SecuredEndpoint.class).readZone();

            assertThat(result).isEqualTo("zone");
            verify(permissionAccessTrace).recordAllowedAccess(PermissionCode.ZONE_READ, "SecuredEndpoint#readZone");
        }
    }

    @Test
    void deniesAndTracesAuthenticationWithoutRequiredPermission() {
        PermissionAccessTrace permissionAccessTrace = mock(PermissionAccessTrace.class);

        try (AnnotationConfigApplicationContext context = createContext(permissionAccessTrace)) {
            SecurityContextHolder.getContext().setAuthentication(authenticationWith("ZONE_CREATE"));

            assertThatExceptionOfType(AccessDeniedException.class)
                    .isThrownBy(() -> context.getBean(SecuredEndpoint.class).readZone());
            verify(permissionAccessTrace).recordDeniedAccess(PermissionCode.ZONE_READ, "SecuredEndpoint#readZone");
        }
    }

    @Test
    void deniesAndTracesUnauthenticatedAccess() {
        PermissionAccessTrace permissionAccessTrace = mock(PermissionAccessTrace.class);

        try (AnnotationConfigApplicationContext context = createContext(permissionAccessTrace)) {
            SecurityContextHolder.clearContext();

            assertThatExceptionOfType(AccessDeniedException.class)
                    .isThrownBy(() -> context.getBean(SecuredEndpoint.class).readZone());
            verify(permissionAccessTrace).recordDeniedAccess(PermissionCode.ZONE_READ, "SecuredEndpoint#readZone");
        }
    }

    private AnnotationConfigApplicationContext createContext(PermissionAccessTrace permissionAccessTrace) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(PermissionSecurityConfiguration.class);
        context.registerBean(PermissionAccessTrace.class, () -> permissionAccessTrace);
        context.registerBean(PermissionAuthorizationManager.class);
        context.registerBean(SecuredEndpoint.class);
        context.refresh();
        return context;
    }

    private UsernamePasswordAuthenticationToken authenticationWith(String permission) {
        return UsernamePasswordAuthenticationToken.authenticated(
                "test-user",
                "unused",
                List.of(new SimpleGrantedAuthority(permission)));
    }

    @RestController
    static class SecuredEndpoint {
        @RequiresPermission(PermissionCode.ZONE_READ)
        public String readZone() {
            return "zone";
        }
    }
}
