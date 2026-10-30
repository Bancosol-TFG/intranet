package es.bancosol.api.common.config;

import java.nio.charset.StandardCharsets;
import java.util.function.Supplier;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import es.bancosol.api.auth.service.AccessTokenService;
import es.bancosol.api.auth.service.PermissionChangeTracker;
import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String CREATE_USERS_PERMISSION = "users:create";

    private final AuthenticationTrustResolver trustResolver = new AuthenticationTrustResolverImpl();

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(server -> server.jwt(jwt -> jwt.jwtAuthenticationConverter(authenticationConverter())))
                .authorizeHttpRequests(requests -> requests
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/refresh", "/auth/logout").permitAll()
                        .requestMatchers("/auth/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/users").access((authentication, context) ->
                                new AuthorizationDecision(canCreateUsers(authentication)))
                        .anyRequest().access((authentication, context) ->
                                new AuthorizationDecision(isReady(authentication.get()))))
                .build();
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtKey, PermissionChangeTracker permissionChangeTracker) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(jwtKey).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(),
                currentPermissionsValidator(permissionChangeTracker)));
        return decoder;
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtKey));
    }

    @Bean
    SecretKey jwtKey(@Value("${auth.jwt-secret}") String jwtSecret) {
        return new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private OAuth2TokenValidator<Jwt> currentPermissionsValidator(PermissionChangeTracker permissionChangeTracker) {
        return jwt -> permissionChangeTracker.isStale(jwt.getIssuedAt())
                ? OAuth2TokenValidatorResult.failure(new OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN))
                : OAuth2TokenValidatorResult.success();
    }

    private JwtAuthenticationConverter authenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName(AccessTokenService.PERMISSIONS_CLAIM);
        authoritiesConverter.setAuthorityPrefix("");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }

    private boolean canCreateUsers(Supplier<? extends Authentication> authentication) {
        Authentication current = authentication.get();
        return isReady(current) && current.getAuthorities().stream()
                .anyMatch(authority -> CREATE_USERS_PERMISSION.equals(authority.getAuthority()));
    }

    private boolean isReady(Authentication authentication) {
        if (!trustResolver.isAuthenticated(authentication)) return false;
        return !(authentication instanceof JwtAuthenticationToken jwtAuthentication)
                || !Boolean.TRUE.equals(jwtAuthentication.getToken().getClaimAsBoolean(AccessTokenService.MUST_CHANGE_PASSWORD_CLAIM));
    }
}
