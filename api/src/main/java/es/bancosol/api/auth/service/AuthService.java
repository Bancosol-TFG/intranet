package es.bancosol.api.auth.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import es.bancosol.api.auth.dto.AuthResponse;
import es.bancosol.api.auth.dto.AuthSession;
import es.bancosol.api.auth.dto.ChangePasswordRequest;
import es.bancosol.api.auth.dto.CurrentUserResponse;
import es.bancosol.api.auth.dto.LoginRequest;
import es.bancosol.api.auth.entity.AuthClient;
import es.bancosol.api.auth.entity.RefreshToken;
import es.bancosol.api.users.entity.User;
import es.bancosol.api.users.repository.UserRepository;
import es.bancosol.api.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Duration WEB_REFRESH_DURATION = Duration.ofDays(7);
    private static final Duration MOBILE_COOKIE_DURATION = Duration.ofDays(3650);
    private static final int REFRESH_TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final RefreshTokenStore refreshTokenStore;
    private final AccessTokenService accessTokenService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public AuthSession login(LoginRequest request) {
        User user = userRepository.findByEmail(UserService.normalizeEmail(request.email()))
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPassword()))
                .orElseThrow(() -> unauthorized());
        return openSession(user, UUID.randomUUID(), request.client(), Instant.now());
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public AuthSession refresh(String refreshToken) {
        if (refreshToken == null) throw unauthorized();
        Instant now = Instant.now();
        RefreshToken current = refreshTokenStore.findForRotation(hash(refreshToken)).orElseThrow(() -> unauthorized());
        if (current.getRevokedAt() != null || current.isExpired(now)) throw unauthorized();
        if (current.getUsedAt() != null) {
            refreshTokenStore.revokeSession(current.getSessionId(), now);
            throw unauthorized();
        }
        current.setUsedAt(now);
        User user = userRepository.findById(current.getUserId()).orElseThrow(() -> unauthorized());
        return openSession(user, current.getSessionId(), current.getClient(), now);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null) return;
        Instant now = Instant.now();
        refreshTokenStore.findForRotation(hash(refreshToken))
                .ifPresent(token -> refreshTokenStore.revokeSession(token.getSessionId(), now));
    }

    @Transactional
    public void changePassword(Integer userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> unauthorized());
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no es correcta.");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        refreshTokenStore.revokeAllForUser(userId, Instant.now());
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse currentUser(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> unauthorized());
        return toCurrentUser(user, userRepository.findPermissionNames(userId));
    }

    private AuthSession openSession(User user, UUID sessionId, AuthClient client, Instant now) {
        String refreshToken = generateRefreshToken();
        Instant expiresAt = client == AuthClient.WEB ? now.plus(WEB_REFRESH_DURATION) : null;
        refreshTokenStore.save(new RefreshToken(sessionId, user.getId(), hash(refreshToken), client, expiresAt));
        List<String> permissions = userRepository.findPermissionNames(user.getId());
        AuthResponse response = new AuthResponse(accessTokenService.issue(user, permissions),
                AccessTokenService.ACCESS_TOKEN_DURATION.toSeconds(), toCurrentUser(user, permissions));
        Duration cookieDuration = client == AuthClient.WEB ? WEB_REFRESH_DURATION : MOBILE_COOKIE_DURATION;
        return new AuthSession(response, refreshToken, cookieDuration);
    }

    private CurrentUserResponse toCurrentUser(User user, List<String> permissions) {
        return CurrentUserResponse.from(user, userRepository.findRoleNames(user.getId()), permissions);
    }

    private String generateRefreshToken() {
        byte[] randomBytes = new byte[REFRESH_TOKEN_BYTES];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes()));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
}
