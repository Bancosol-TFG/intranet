package es.bancosol.api.common.security;

import java.lang.reflect.Method;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerMethod;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class EndpointAccessInterceptorTests {
    @Test
    void permitsAndTracesPublicEndpoint() throws Exception {
        PermissionAccessTrace permissionAccessTrace = mock(PermissionAccessTrace.class);
        EndpointAccessInterceptor interceptor = new EndpointAccessInterceptor(permissionAccessTrace);
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean accepted = interceptor.preHandle(
                new MockHttpServletRequest(),
                response,
                handlerMethod("publicEndpoint"));

        assertThat(accepted).isTrue();
        verify(permissionAccessTrace).recordPublicAccess("AccessTestController#publicEndpoint");
    }

    @Test
    void rejectsAndTracesEndpointWithoutAccessDeclaration() throws Exception {
        PermissionAccessTrace permissionAccessTrace = mock(PermissionAccessTrace.class);
        EndpointAccessInterceptor interceptor = new EndpointAccessInterceptor(permissionAccessTrace);
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean accepted = interceptor.preHandle(
                new MockHttpServletRequest(),
                response,
                handlerMethod("unlabeledEndpoint"));

        assertThat(accepted).isFalse();
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_FORBIDDEN);
        verify(permissionAccessTrace).recordMissingAccessDeclaration("AccessTestController#unlabeledEndpoint");
    }

    @Test
    void rejectsEndpointWithConflictingAccessDeclarations() throws Exception {
        PermissionAccessTrace permissionAccessTrace = mock(PermissionAccessTrace.class);
        EndpointAccessInterceptor interceptor = new EndpointAccessInterceptor(permissionAccessTrace);
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean accepted = interceptor.preHandle(
                new MockHttpServletRequest(),
                response,
                handlerMethod("conflictingEndpoint"));

        assertThat(accepted).isFalse();
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_FORBIDDEN);
    }

    private HandlerMethod handlerMethod(String methodName) throws NoSuchMethodException {
        AccessTestController controller = new AccessTestController();
        Method method = AccessTestController.class.getMethod(methodName);
        return new HandlerMethod(controller, method);
    }

    @RestController
    static class AccessTestController {
        @Public
        public void publicEndpoint() {
        }

        @RequiresAuthentication
        public void authenticatedEndpoint() {
        }

        public void unlabeledEndpoint() {
        }

        @Public
        @RequiresAuthentication
        public void conflictingEndpoint() {
        }
    }
}
