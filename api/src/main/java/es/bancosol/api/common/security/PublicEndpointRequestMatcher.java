package es.bancosol.api.common.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@Component
@RequiredArgsConstructor
@Slf4j
public class PublicEndpointRequestMatcher implements RequestMatcher {
    private final ObjectProvider<RequestMappingHandlerMapping> handlerMappingProvider;

    @Override
    public boolean matches(HttpServletRequest request) {
        try {
            HandlerExecutionChain handlerChain = handlerMappingProvider.getObject().getHandler(request);
            if (handlerChain == null || !(handlerChain.getHandler() instanceof HandlerMethod handlerMethod)) {
                return false;
            }

            return AnnotatedElementUtils.findMergedAnnotation(handlerMethod.getMethod(), Public.class) != null;
        } catch (Exception exception) {
            log.warn("Unable to resolve endpoint access for request {} {}.", request.getMethod(),
                    request.getRequestURI(), exception);
            return false;
        }
    }
}
