package es.bancosol.api.auth.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import es.bancosol.api.users.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccessTokenService {
    public static final Duration ACCESS_TOKEN_DURATION = Duration.ofMinutes(15);
    public static final String PERMISSIONS_CLAIM = "permissions";
    public static final String MUST_CHANGE_PASSWORD_CLAIM = "mustChangePassword";

    private final JwtEncoder jwtEncoder;

    public String issue(User user, List<String> permissions) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(user.getId()))
                .issuedAt(now)
                .expiresAt(now.plus(ACCESS_TOKEN_DURATION))
                .claim(PERMISSIONS_CLAIM, permissions)
                .claim(MUST_CHANGE_PASSWORD_CLAIM, user.isMustChangePassword())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
