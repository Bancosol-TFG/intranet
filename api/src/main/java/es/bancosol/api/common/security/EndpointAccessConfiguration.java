package es.bancosol.api.common.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class EndpointAccessConfiguration implements WebMvcConfigurer {
    private final EndpointAccessInterceptor endpointAccessInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(endpointAccessInterceptor);
    }
}
