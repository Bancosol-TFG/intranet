package es.bancosol.api.auth.controller;

import java.time.Duration;
import es.bancosol.api.auth.dto.AuthResponse;
import es.bancosol.api.auth.dto.AuthSession;
import es.bancosol.api.auth.dto.ChangePasswordRequest;
import es.bancosol.api.auth.dto.CurrentUserResponse;
import es.bancosol.api.auth.dto.LoginRequest;
import es.bancosol.api.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final String REFRESH_COOKIE = "refreshToken";

    private final AuthService service;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return respond(service.login(request), response);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
                                HttpServletResponse response) {
        return respond(service.refresh(refreshToken), response);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
                       HttpServletResponse response) {
        service.logout(refreshToken);
        writeCookie(response, "", Duration.ZERO);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ChangePasswordRequest request,
                               HttpServletResponse response) {
        service.changePassword(Integer.valueOf(jwt.getSubject()), request);
        writeCookie(response, "", Duration.ZERO);
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return service.currentUser(Integer.valueOf(jwt.getSubject()));
    }

    private AuthResponse respond(AuthSession session, HttpServletResponse response) {
        writeCookie(response, session.refreshToken(), session.refreshTokenDuration());
        return session.response();
    }

    private void writeCookie(HttpServletResponse response, String value, Duration duration) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true).secure(true).sameSite("Strict").path("/").maxAge(duration).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
