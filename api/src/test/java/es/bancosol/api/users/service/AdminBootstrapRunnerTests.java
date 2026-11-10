package es.bancosol.api.users.service;

import java.util.List;
import es.bancosol.api.users.entity.User;
import es.bancosol.api.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AdminBootstrapRunnerTests {
    private static final String ADMIN_ROLE = "ADMIN";

    @Test
    void doesNotCreateBootstrapAccountWhenBothCredentialsAreEmpty() {
        UserRepository repository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        AdminBootstrapRunner runner = runner(repository, passwordEncoder, " ", "");

        runner.run(mock(ApplicationArguments.class));

        verifyNoInteractions(repository, passwordEncoder);
    }

    @Test
    void rejectsIncompleteBootstrapCredentials() {
        for (String[] credentials : List.of(new String[] {"admin@bancosol.com", ""},
                new String[] {"", "password"})) {
            UserRepository repository = mock(UserRepository.class);
            PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
            AdminBootstrapRunner runner = runner(repository, passwordEncoder, credentials[0], credentials[1]);

            assertThatThrownBy(() -> runner.run(mock(ApplicationArguments.class)))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("ADMIN_EMAIL y ADMIN_PASSWORD")
                    .hasMessageContaining("juntas");

            verifyNoInteractions(repository, passwordEncoder);
        }
    }

    @Test
    void failsWhenThereIsNoActiveAdminRole() {
        UserRepository repository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(repository.countRoles(List.of(ADMIN_ROLE))).thenReturn(0L);
        AdminBootstrapRunner runner = runner(repository, passwordEncoder, "admin@bancosol.com", "password");

        assertThatThrownBy(() -> runner.run(mock(ApplicationArguments.class)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("exactamente un rol ADMIN activo");

        verify(repository).countRoles(List.of(ADMIN_ROLE));
        verify(repository, never()).existsByEmail(any());
        verify(repository, never()).saveAndFlush(any(User.class));
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void createsBootstrapAccountAndAssignsTheActiveAdminRole() {
        UserRepository repository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(repository.countRoles(List.of(ADMIN_ROLE))).thenReturn(1L);
        when(repository.existsByEmail("admin@bancosol.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded-password");
        when(repository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            ReflectionTestUtils.setField(user, "id", 42);
            return user;
        });
        AdminBootstrapRunner runner = runner(repository, passwordEncoder, " Admin@Bancosol.com ", "password");

        runner.run(mock(ApplicationArguments.class));

        verify(repository).countRoles(List.of(ADMIN_ROLE));
        verify(repository).existsByEmail("admin@bancosol.com");
        verify(passwordEncoder).encode("password");
        verify(repository).assignRoles(42, List.of(ADMIN_ROLE));
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(repository).saveAndFlush(userCaptor.capture());
        assertThat(userCaptor.getValue().getFirstName()).isEqualTo("Administrador");
        assertThat(userCaptor.getValue().getEmail()).isEqualTo("admin@bancosol.com");
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("encoded-password");
    }

    @Test
    void doesNotDuplicateAnExistingBootstrapAccount() {
        UserRepository repository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(repository.countRoles(List.of(ADMIN_ROLE))).thenReturn(1L);
        when(repository.existsByEmail("admin@bancosol.com")).thenReturn(true);
        AdminBootstrapRunner runner = runner(repository, passwordEncoder, "admin@bancosol.com", "password");

        runner.run(mock(ApplicationArguments.class));

        verify(repository).countRoles(List.of(ADMIN_ROLE));
        verify(repository).existsByEmail("admin@bancosol.com");
        verify(repository, never()).saveAndFlush(any(User.class));
        verify(repository, never()).assignRoles(any(), any());
        verifyNoInteractions(passwordEncoder);
    }

    private AdminBootstrapRunner runner(UserRepository repository, PasswordEncoder passwordEncoder, String email,
            String password) {
        AdminBootstrapRunner runner = new AdminBootstrapRunner(repository, passwordEncoder);
        ReflectionTestUtils.setField(runner, "adminEmail", email);
        ReflectionTestUtils.setField(runner, "adminPassword", password);
        return runner;
    }
}
