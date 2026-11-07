package es.bancosol.api.common.security;

import java.lang.reflect.Method;
import java.util.function.Supplier;

import org.aopalliance.intercept.MethodInvocation;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.AuthorizationResult;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor 
public class PermissionAuthorizationManager implements AuthorizationManager<MethodInvocation> {
    private final PermissionAccessTrace permissionAccessTrace;

    @Override
    public AuthorizationResult authorize(
            Supplier<? extends Authentication> authenticationSupplier,
            MethodInvocation invocation) {
        Method method = invocation.getMethod();
        RequiresPermission requiresPermission = AnnotatedElementUtils.findMergedAnnotation(method, RequiresPermission.class);

        if (requiresPermission == null) {
            return new AuthorizationDecision(true);
        }

        PermissionCode permissionCode = requiresPermission.value();
        String endpoint = method.getDeclaringClass().getSimpleName() + "#" + method.getName();
        Authentication authentication;
        try {
            authentication = authenticationSupplier.get();
        } catch (AuthenticationCredentialsNotFoundException exception) {
            authentication = null;
        }
        boolean allowed = isAllowed(authentication, permissionCode);

        if (allowed) {
            permissionAccessTrace.recordAllowedAccess(permissionCode, endpoint);
        } else {
            permissionAccessTrace.recordDeniedAccess(permissionCode, endpoint);
        }

        return new AuthorizationDecision(allowed);
    }

    private boolean isAllowed(Authentication authentication, PermissionCode permissionCode) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> permissionCode.name().equals(authority.getAuthority()));
    }
}
