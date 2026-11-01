package es.bancosol.api.auth;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import com.jayway.jsonpath.JsonPath;
import es.bancosol.api.auth.service.PermissionChangeTracker;
import es.bancosol.api.users.entity.User;
import es.bancosol.api.users.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTests {
    private static final String PASSWORD = "contrasena-valida";

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private StringRedisTemplate redisTemplate;
    @Autowired private PermissionChangeTracker permissionChangeTracker;

    @AfterEach
    void clearPermissionChange() {
        redisTemplate.delete(PermissionChangeTracker.LAST_CHANGE_KEY);
    }

    @Test
    void rejectsProtectedEndpointWithoutValidToken() throws Exception {
        mockMvc.perform(get("/zones")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/zones").header(HttpHeaders.AUTHORIZATION, "Bearer invalid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logsInAndReadsCurrentUserAndProtectedEndpoint() throws Exception {
        String email = createUser(false);
        MockHttpServletResponse login = login(email, PASSWORD, "WEB");
        assertThat(login.getHeader(HttpHeaders.SET_COOKIE)).contains("HttpOnly", "Secure", "SameSite=Strict");
        mockMvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(login)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value(email));
        mockMvc.perform(get("/zones").header(HttpHeaders.AUTHORIZATION, bearer(login))).andExpect(status().isOk());
    }

    @Test
    void rejectsWrongPassword() throws Exception {
        mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(createUser(false), "incorrecta", "WEB")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rotatesRefreshTokenAndRevokesSessionWhenItIsReused() throws Exception {
        MockHttpServletResponse login = login(createUser(false), PASSWORD, "WEB");
        Cookie first = login.getCookie("refreshToken");
        MockHttpServletResponse refreshed = refresh(first).andExpect(status().isOk()).andReturn().getResponse();
        Cookie second = refreshed.getCookie("refreshToken");
        assertThat(second.getValue()).isNotEqualTo(first.getValue());
        refresh(first).andExpect(status().isUnauthorized());
        refresh(second).andExpect(status().isUnauthorized());
    }

    @Test
    void setsExpirationOnlyOnWebRefreshTokens() throws Exception {
        String email = createUser(false);
        login(email, PASSWORD, "WEB");
        login(email, PASSWORD, "MOBILE");
        List<String> clientsWithoutExpiration = jdbcTemplate.queryForList("""
                SELECT client FROM refresh_tokens
                JOIN users ON users.id = refresh_tokens.user_id
                WHERE users.email = ? AND expires_at IS NULL
                """, String.class, email);
        assertThat(clientsWithoutExpiration).containsExactly("MOBILE");
    }

    @Test
    void logoutRevokesRefreshToken() throws Exception {
        Cookie cookie = login(createUser(false), PASSWORD, "WEB").getCookie("refreshToken");
        mockMvc.perform(post("/auth/logout").cookie(cookie)).andExpect(status().isNoContent());
        refresh(cookie).andExpect(status().isUnauthorized());
    }

    @Test
    void temporaryPasswordOnlyAllowsChangingItAndChangingItRevokesSessions() throws Exception {
        String email = createUser(true);
        MockHttpServletResponse login = login(email, PASSWORD, "WEB");
        mockMvc.perform(get("/zones").header(HttpHeaders.AUTHORIZATION, bearer(login))).andExpect(status().isForbidden());
        mockMvc.perform(post("/auth/change-password").header(HttpHeaders.AUTHORIZATION, bearer(login))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"%s\",\"newPassword\":\"nueva-contrasena\"}".formatted(PASSWORD)))
                .andExpect(status().isNoContent());
        refresh(login.getCookie("refreshToken")).andExpect(status().isUnauthorized());
        MockHttpServletResponse newLogin = login(email, "nueva-contrasena", "WEB");
        mockMvc.perform(get("/zones").header(HttpHeaders.AUTHORIZATION, bearer(newLogin))).andExpect(status().isOk());
    }

    @Test
    void rejectsTokenIssuedBeforePermissionChangeAndAcceptsRefreshedOne() throws Exception {
        MockHttpServletResponse login = login(createUser(false), PASSWORD, "WEB");
        redisTemplate.opsForValue().set(PermissionChangeTracker.LAST_CHANGE_KEY, Instant.now().plusSeconds(1).toString());
        mockMvc.perform(get("/zones").header(HttpHeaders.AUTHORIZATION, bearer(login)))
                .andExpect(status().isUnauthorized());
        redisTemplate.delete(PermissionChangeTracker.LAST_CHANGE_KEY);
        permissionChangeTracker.markChanged();
        MockHttpServletResponse refreshed = refresh(login.getCookie("refreshToken"))
                .andExpect(status().isOk()).andReturn().getResponse();
        mockMvc.perform(get("/zones").header(HttpHeaders.AUTHORIZATION, bearer(refreshed))).andExpect(status().isOk());
    }

    @Test
    void onlyUsersWithPermissionCreateAccounts() throws Exception {
        String regularEmail = createUser(false);
        String adminEmail = createUser(false);
        jdbcTemplate.update("""
                INSERT INTO user_roles (user_id, role_id)
                SELECT users.id, roles.id FROM users, roles WHERE users.email = ? AND roles.name = 'ADMIN'
                """, adminEmail);
        String body = "{\"firstName\":\"Ana\",\"email\":\"%s\",\"roles\":[\"ADMIN\"]}".formatted(uniqueEmail());
        mockMvc.perform(post("/users").header(HttpHeaders.AUTHORIZATION, bearer(login(regularEmail, PASSWORD, "WEB")))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/users").header(HttpHeaders.AUTHORIZATION, bearer(login(adminEmail, PASSWORD, "WEB")))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.temporaryPassword").isNotEmpty());
    }

    private String createUser(boolean mustChangePassword) {
        User user = new User("Prueba", null, null, uniqueEmail(), passwordEncoder.encode(PASSWORD));
        user.setMustChangePassword(mustChangePassword);
        return userRepository.save(user).getEmail();
    }

    private MockHttpServletResponse login(String email, String password, String client) throws Exception {
        return mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email, password, client)))
                .andExpect(status().isOk()).andReturn().getResponse();
    }

    private org.springframework.test.web.servlet.ResultActions refresh(Cookie cookie) throws Exception {
        return mockMvc.perform(post("/auth/refresh").cookie(cookie));
    }

    private String bearer(MockHttpServletResponse response) throws Exception {
        return "Bearer " + JsonPath.read(response.getContentAsString(), "$.accessToken");
    }

    private String loginBody(String email, String password, String client) {
        return "{\"email\":\"%s\",\"password\":\"%s\",\"client\":\"%s\"}".formatted(email, password, client);
    }

    private String uniqueEmail() {
        return UUID.randomUUID() + "@example.com";
    }
}
