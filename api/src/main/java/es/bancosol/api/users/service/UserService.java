package es.bancosol.api.users.service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import es.bancosol.api.users.dto.CreatedUserResponse;
import es.bancosol.api.users.dto.UserRequest;
import es.bancosol.api.users.entity.User;
import es.bancosol.api.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final int TEMPORARY_PASSWORD_BYTES = 12;

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public CreatedUserResponse create(UserRequest request) {
        String email = normalizeEmail(request.email());
        List<String> roles = request.roles().stream().distinct().toList();
        if (repository.existsByEmail(email)) throw duplicateEmail(null);
        if (repository.countRoles(roles) != roles.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alguno de los roles no existe.");
        }
        String temporaryPassword = generateTemporaryPassword();
        User user = new User(request.firstName(), request.surname(), request.phoneNumber(), email,
                passwordEncoder.encode(temporaryPassword));
        try {
            repository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw duplicateEmail(exception);
        }
        repository.assignRoles(user.getId(), roles);
        return CreatedUserResponse.from(user, roles, temporaryPassword);
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String generateTemporaryPassword() {
        byte[] randomBytes = new byte[TEMPORARY_PASSWORD_BYTES];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private ResponseStatusException duplicateEmail(Throwable cause) {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo.", cause);
    }
}
