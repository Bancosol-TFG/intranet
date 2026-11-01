package es.bancosol.api.auth.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionChangeTracker {
    public static final String LAST_CHANGE_KEY = "auth:permissions:last-change";

    private final StringRedisTemplate redisTemplate;

    public void markChanged() {
        redisTemplate.opsForValue().set(LAST_CHANGE_KEY, Instant.now().truncatedTo(ChronoUnit.SECONDS).toString());
    }

    public boolean isStale(Instant tokenIssuedAt) {
        return lastChange().filter(tokenIssuedAt::isBefore).isPresent();
    }

    private Optional<Instant> lastChange() {
        try {
            return Optional.ofNullable(redisTemplate.opsForValue().get(LAST_CHANGE_KEY)).map(Instant::parse);
        } catch (DataAccessException exception) {
            log.warn("Could not read the last permission change from Redis", exception);
            return Optional.empty();
        }
    }
}
