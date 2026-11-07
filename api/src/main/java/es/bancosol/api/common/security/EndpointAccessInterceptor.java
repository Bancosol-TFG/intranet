package es.bancosol.api.common.security;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class EndpointAccessInterceptor implements HandlerInterceptor {
    private static final String APPLICATION_PACKAGE_PREFIX = "es.bancosol.api.";

    private final PermissionAccessTrace permissionAccessTrace;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if (!(handler instanceof HandlerMethod handlerMethod)
                || !handlerMethod.getBeanType().getPackageName().startsWith(APPLICATION_PACKAGE_PREFIX)) {
            return true;
        }

        Method method = handlerMethod.getMethod();
        List<Class<? extends Annotation>> accessAnnotations = List.of(
                RequiresPermission.class,
                RequiresAuthentication.class,
                Public.class)
                .stream()
                .filter(annotation -> AnnotatedElementUtils.findMergedAnnotation(method, annotation) != null)
                .toList();
        String endpoint = handlerMethod.getBeanType().getSimpleName() + "#" + method.getName();

        if (accessAnnotations.size() != 1) {
            if (accessAnnotations.isEmpty()) {
                permissionAccessTrace.recordMissingAccessDeclaration(endpoint);
            } else {
                log.warn("Blocking endpoint with conflicting access declarations: endpoint={}", endpoint);
            }
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }

        if (accessAnnotations.getFirst() == Public.class) {
            permissionAccessTrace.recordPublicAccess(endpoint);
        }

        return true;
    }
}
