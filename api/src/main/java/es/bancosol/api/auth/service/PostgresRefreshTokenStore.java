package es.bancosol.api.auth.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import es.bancosol.api.auth.entity.RefreshToken;
import es.bancosol.api.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostgresRefreshTokenStore implements RefreshTokenStore {
    private final RefreshTokenRepository repository;

    @Override
    public void save(RefreshToken token) {
        repository.save(token);
    }

    @Override
    public Optional<RefreshToken> findForRotation(String tokenHash) {
        return repository.findByTokenHash(tokenHash);
    }

    @Override
    public void revokeSession(UUID sessionId, Instant now) {
        repository.revokeSession(sessionId, now);
    }

    @Override
    public void revokeAllForUser(Integer userId, Instant now) {
        repository.revokeAllForUser(userId, now);
    }
}
