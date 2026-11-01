package es.bancosol.api.auth.dto;

import java.time.Duration;

public record AuthSession(AuthResponse response, String refreshToken, Duration refreshTokenDuration) {
}
