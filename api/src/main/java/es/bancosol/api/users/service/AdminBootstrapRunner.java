package es.bancosol.api.users.service;

import java.util.List;
import es.bancosol.api.users.entity.User;
import es.bancosol.api.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE)
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
        if (adminEmail.isBlank() && adminPassword.isBlank()) return;
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            throw new IllegalStateException("ADMIN_EMAIL y ADMIN_PASSWORD deben configurarse juntas.");
        }
        if (repository.countRoles(List.of(ADMIN_ROLE)) != 1) {
            throw new IllegalStateException("Debe existir exactamente un rol ADMIN activo para crear la cuenta de bootstrap.");
        }
        String email = UserService.normalizeEmail(adminEmail);
        if (repository.existsByEmail(email)) return;
        User admin = repository.saveAndFlush(new User("Administrador", null, null, email,
                passwordEncoder.encode(adminPassword)));
        repository.assignRoles(admin.getId(), List.of(ADMIN_ROLE));
    }
}
