package es.bancosol.api.common.security;

import java.time.Instant;
import java.util.stream.Stream;
import es.bancosol.api.roles.dto.CatalogPermissionReference;
import es.bancosol.api.roles.dto.CatalogRole;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.repository.PermissionRepository;
import es.bancosol.api.roles.service.CatalogValidationException;
import es.bancosol.api.roles.service.RolePermissionCatalogChecker;
import es.bancosol.api.roles.service.RolePermissionCatalogLoader;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;

@SpringBootTest
@AutoConfigureMockMvc
class ControllerPermissionIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RolePermissionCatalogChecker rolePermissionCatalogChecker;

    @Test
    void allowsZoneListingOnlyWithZoneListPermission() throws Exception {
        mockMvc.perform(get("/zones").with(user("zone-reader").authorities(() -> "ZONE_LIST")))
                .andExpect(status().isOk());

        mockMvc.perform(get("/zones").with(user("zone-reader").authorities(() -> "ZONE_READ")))
                .andExpect(status().isForbidden());
    }

    @Test
    void allowsZoneReadOnlyWithZoneReadPermission() throws Exception {
        mockMvc.perform(get("/zones/{zoneId}", 987654321)
                        .with(user("zone-reader").authorities(() -> "ZONE_READ")))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/zones/{zoneId}", 987654321)
                        .with(user("zone-reader").authorities(() -> "ZONE_LIST")))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithAnonymousUser
    void deniesZoneAccessWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/zones")).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0} {1}, role {3}: HTTP {5}")
    @MethodSource("writeEndpointAccessCases")
    @Transactional
    void enforcesCatalogPermissionsOnValidatedRequests(HttpMethod method, String path, String body,
            String roleName, CatalogRole role, int expectedStatus) throws Exception {
        var requestBuilder = request(method, path).contentType(MediaType.APPLICATION_JSON).content(body);
        if (role != null) {
            requestBuilder.with(user(roleName).authorities(role.permissions().stream()
                    .map(reference -> new SimpleGrantedAuthority(reference.name())).toList()));
        }

        mockMvc.perform(requestBuilder).andExpect(status().is(expectedStatus));
    }

    private static Stream<Arguments> writeEndpointAccessCases() {
        var roles = new RolePermissionCatalogLoader().load().roles();
        return validatedWriteEndpoints().flatMap(endpoint -> Stream.concat(
                Stream.of(endpoint.accessCase(null, 401)),
                roles.stream().map(role -> {
                    boolean hasPermission = role.permissions().stream().map(CatalogPermissionReference::name)
                            .anyMatch(endpoint.permission().name()::equals);
                    return endpoint.accessCase(role, hasPermission ? endpoint.allowedStatus() : 403);
                })));
    }

    private static Stream<WriteEndpoint> validatedWriteEndpoints() {
        String name = """
                {"name":"Permission test"}
                """;
        String nameAndCode = """
                {"name":"Permission test","code":"permission-test"}
                """;
        String locality = """
                {"name":"Permission test","postalCode":"29001"}
                """;
        String collaborator = """
                {"name":"Permission test","address":"Test address","localityId":987654321}
                """;
        String contact = """
                {"name":"Permission test","phoneNumber":"+1 (202) 555-0144"}
                """;
        String campaign = """
                {"name":"Permission test","campaignTypeId":987654321,"startDate":"2030-01-01","endDate":"2030-01-02"}
                """;
        String store = """
                {"name":"Permission test","address":"Test address","checkoutShelfs":0,"chainId":987654321,
                "localityId":987654321}
                """;
        String schedule = """
                {"weekDay":1,"openingTime":"09:00","closingTime":"12:00"}
                """;
        String closure = """
                {"date":"2030-01-01","closed":true}
                """;
        String closedDay = """
                {"date":"2030-01-01","closed":true,"slots":[],"expected":[]}
                """;
        String userBody = """
                {"firstName":"Permission test","email":"permission-test@example.org",
                "phoneNumber":"+1 (202) 555-0144","roles":["ADMIN"]}
                """;
        String missing = "/987654321";
        String contacts = "/collaborators" + missing + "/contacts";
        String schedules = "/stores" + missing + "/schedules";
        String exceptions = "/stores" + missing + "/schedule-exceptions";

        return Stream.of(
                new WriteEndpoint(HttpMethod.POST, "/users", userBody, PermissionCode.USER_CREATE, 201),
                new WriteEndpoint(HttpMethod.POST, "/roles", name, PermissionCode.ROLE_CREATE, 201),
                new WriteEndpoint(HttpMethod.POST, "/campaigns", campaign, PermissionCode.CAMPAIGN_CREATE, 404),
                new WriteEndpoint(HttpMethod.PUT, "/campaigns" + missing, campaign, PermissionCode.CAMPAIGN_UPDATE, 404),
                new WriteEndpoint(HttpMethod.POST, "/campaign-types", name, PermissionCode.CAMPAIGN_TYPE_CREATE, 201),
                new WriteEndpoint(HttpMethod.PUT, "/campaign-types" + missing, name,
                        PermissionCode.CAMPAIGN_TYPE_UPDATE, 404),
                new WriteEndpoint(HttpMethod.POST, "/collaborators", collaborator, PermissionCode.COLLABORATOR_CREATE, 404),
                new WriteEndpoint(HttpMethod.PUT, "/collaborators" + missing, collaborator,
                        PermissionCode.COLLABORATOR_UPDATE, 404),
                new WriteEndpoint(HttpMethod.POST, contacts, contact, PermissionCode.CONTACT_CREATE, 404),
                new WriteEndpoint(HttpMethod.PUT, contacts + missing, contact, PermissionCode.CONTACT_UPDATE, 404),
                new WriteEndpoint(HttpMethod.POST, "/chains", nameAndCode, PermissionCode.CHAIN_CREATE, 201),
                new WriteEndpoint(HttpMethod.PUT, "/chains" + missing, nameAndCode, PermissionCode.CHAIN_UPDATE, 404),
                new WriteEndpoint(HttpMethod.POST, "/stores", store, PermissionCode.STORE_CREATE, 400),
                new WriteEndpoint(HttpMethod.PUT, "/stores" + missing, store, PermissionCode.STORE_UPDATE, 404),
                new WriteEndpoint(HttpMethod.POST, schedules, schedule, PermissionCode.SCHEDULE_CREATE, 404),
                new WriteEndpoint(HttpMethod.PUT, schedules + missing, schedule, PermissionCode.SCHEDULE_UPDATE, 404),
                new WriteEndpoint(HttpMethod.POST, exceptions, closure, PermissionCode.SCHEDULE_EXCEPTION_CREATE, 404),
                new WriteEndpoint(HttpMethod.PUT, exceptions + missing, closure, PermissionCode.SCHEDULE_EXCEPTION_UPDATE, 404),
                new WriteEndpoint(HttpMethod.PUT, exceptions + "/day", closedDay, PermissionCode.SCHEDULE_EXCEPTION_CREATE, 404),
                new WriteEndpoint(HttpMethod.POST, "/zones", nameAndCode, PermissionCode.ZONE_CREATE, 201),
                new WriteEndpoint(HttpMethod.PUT, "/zones" + missing, nameAndCode, PermissionCode.ZONE_UPDATE, 404),
                new WriteEndpoint(HttpMethod.POST, "/localities", locality, PermissionCode.LOCALITY_CREATE, 201),
                new WriteEndpoint(HttpMethod.PUT, "/localities" + missing, locality, PermissionCode.LOCALITY_UPDATE, 404));
    }

    private record WriteEndpoint(HttpMethod method, String path, String body, PermissionCode permission,
                                 int allowedStatus) {
        Arguments accessCase(CatalogRole role, int expectedStatus) {
            return Arguments.of(method, path, body, role == null ? "anonymous" : role.name(), role, expectedStatus);
        }
    }

    @Test
    @Transactional
    void endpointCheckerReportsTheEndpointWhenItsPermissionIsMissingFromPostgres() {
        Permission permission = permissionRepository.findByName(PermissionCode.USER_CREATE.name()).orElseThrow();
        permission.setDeletedAt(Instant.now());
        permissionRepository.saveAndFlush(permission);

        assertThatThrownBy(rolePermissionCatalogChecker::checkEndpointsAgainstDatabase)
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("USER_CREATE")
                .hasMessageContaining("POST /users")
                .hasMessageContaining("UserController#create")
                .hasMessageContaining("no existe activo en la BD");
    }
}
