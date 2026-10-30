package es.bancosol.api.auth.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import es.bancosol.api.auth.entity.RefreshToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE RefreshToken token SET token.revokedAt = :now "
            + "WHERE token.sessionId = :sessionId AND token.revokedAt IS NULL")
    void revokeSession(@Param("sessionId") UUID sessionId, @Param("now") Instant now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE RefreshToken token SET token.revokedAt = :now "
            + "WHERE token.userId = :userId AND token.revokedAt IS NULL")
    void revokeAllForUser(@Param("userId") Integer userId, @Param("now") Instant now);
}
