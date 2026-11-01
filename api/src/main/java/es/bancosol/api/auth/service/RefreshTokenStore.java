package es.bancosol.api.auth.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import es.bancosol.api.auth.entity.RefreshToken;

public interface RefreshTokenStore {
    void save(RefreshToken token);

    Optional<RefreshToken> findForRotation(String tokenHash);

    void revokeSession(UUID sessionId, Instant now);

    void revokeAllForUser(Integer userId, Instant now);
}
