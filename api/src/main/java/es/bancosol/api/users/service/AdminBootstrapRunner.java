package es.bancosol.api.users.service;

import java.util.List;
import es.bancosol.api.users.entity.User;
import es.bancosol.api.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements ApplicationRunner {
    private static final String ADMIN_ROLE = "ADMIN";

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Value("${auth.admin-email:}")
    private String adminEmail;

    @Value("${auth.admin-password:}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        if (adminEmail.isBlank() || adminPassword.isBlank()) return;
        String email = UserService.normalizeEmail(adminEmail);
        if (repository.existsByEmail(email)) return;
        User admin = repository.saveAndFlush(new User("Administrador", null, null, email,
                passwordEncoder.encode(adminPassword)));
        repository.assignRoles(admin.getId(), List.of(ADMIN_ROLE));
    }
}
