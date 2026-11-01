package es.bancosol.api.auth.dto;

public record AuthResponse(String accessToken, long expiresIn, CurrentUserResponse user) {
}
