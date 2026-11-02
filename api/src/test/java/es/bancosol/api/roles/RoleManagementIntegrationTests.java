package es.bancosol.api.roles;

import java.util.UUID;
import es.bancosol.api.auth.service.PermissionChangeTracker;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.entity.Role;
import es.bancosol.api.roles.repository.PermissionRepository;
import es.bancosol.api.roles.repository.RolePermissionRepository;
import es.bancosol.api.roles.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasItem;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.unauthenticated;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RoleManagementIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @MockitoBean
    private PermissionChangeTracker permissionChangeTracker;

    @Test
    void createsAndListsRolesForUsersWithTheRequiredPermissions() throws Exception {
        String roleName = uniqueName();

        mockMvc.perform(post("/roles")
                        .with(user("manager").authorities(() -> "ROLE_CREATE", () -> "ROLE_LIST"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(roleBody(roleName)))
                .andExpect(authenticated())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value(roleName));

        mockMvc.perform(get("/roles")
                        .with(user("manager").authorities(() -> "ROLE_LIST"))
                        .param("sort", "name,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].name", hasItem(roleName)));
    }

    @Test
    void rejectsBlankAndDuplicateRoleNames() throws Exception {
        mockMvc.perform(post("/roles")
                        .with(user("manager").authorities(() -> "ROLE_CREATE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"   \"}"))
                .andExpect(status().isBadRequest());

        String roleName = uniqueName();
        mockMvc.perform(post("/roles")
                        .with(user("manager").authorities(() -> "ROLE_CREATE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(roleBody(roleName)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/roles")
                        .with(user("manager").authorities(() -> "ROLE_CREATE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(roleBody(roleName)))
                .andExpect(status().isConflict());
    }

    @Test
    void listsCatalogPermissionsOnlyForUsersWithPermissionListAuthority() throws Exception {
        mockMvc.perform(get("/permissions")
                        .with(user("manager").authorities(() -> "PERMISSION_LIST")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", hasItem("ZONE_READ")));

        mockMvc.perform(get("/permissions")
                        .with(user("manager").authorities(() -> "ROLE_LIST")))
                .andExpect(status().isForbidden());
    }

    @Test
    void assignsRevokesAndReactivatesRolePermissionsIdempotently() throws Exception {
        Role role = roleRepository.saveAndFlush(new Role(uniqueName()));
        Permission permission = permissionRepository.findByName("ZONE_READ").orElseThrow();
        String permissionRoute = "/roles/" + role.getId() + "/permissions/" + permission.getId();
        var manager = user("manager").authorities(
                () -> "ROLE_PERMISSION_ASSIGN",
                () -> "ROLE_PERMISSION_LIST",
                () -> "ROLE_PERMISSION_REVOKE");

        mockMvc.perform(put(permissionRoute).with(manager))
                .andExpect(status().isNoContent());
        mockMvc.perform(put(permissionRoute).with(manager))
                .andExpect(status().isNoContent());

        assertActiveAssignmentCount(role, permission, 1);
        mockMvc.perform(get("/roles/{roleId}/permissions", role.getId())
                        .with(manager))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", hasItem("ZONE_READ")));

        mockMvc.perform(delete(permissionRoute).with(manager))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete(permissionRoute).with(manager))
                .andExpect(status().isNoContent());

        assertActiveAssignmentCount(role, permission, 0);
        mockMvc.perform(get("/roles/{roleId}/permissions", role.getId())
                        .with(manager))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(put(permissionRoute).with(manager))
                .andExpect(status().isNoContent());

        assertActiveAssignmentCount(role, permission, 1);
        assert rolePermissionRepository.findByRole_IdAndPermission_IdAndDeletedAtIsNotNull(
                role.getId(), permission.getId()).isEmpty();
        verify(permissionChangeTracker, times(3)).markChanged();
    }

    @Test
    void returnsNotFoundForUnknownRolesAndPermissions() throws Exception {
        Permission permission = permissionRepository.findByName("ZONE_READ").orElseThrow();
        Role role = roleRepository.saveAndFlush(new Role(uniqueName()));
        var manager = user("manager").authorities(() -> "ROLE_PERMISSION_ASSIGN");

        mockMvc.perform(put("/roles/{roleId}/permissions/{permissionId}", -1, permission.getId())
                        .with(manager))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/roles/{roleId}/permissions/{permissionId}", role.getId(), -1)
                        .with(manager))
                .andExpect(status().isNotFound());
    }

    @Test
    void deniesRoleAccessWithoutAnAuthenticatedPrincipal() throws Exception {
        mockMvc.perform(get("/roles"))
                .andExpect(unauthenticated())
                .andExpect(status().isUnauthorized());
    }

    private void assertActiveAssignmentCount(Role role, Permission permission, int expectedCount) {
        assertThat(rolePermissionRepository
                .findByRole_IdAndPermission_IdAndDeletedAtIsNull(role.getId(), permission.getId())
                .isPresent()).isEqualTo(expectedCount == 1);
    }

    private String uniqueName() {
        return "role-" + UUID.randomUUID();
    }

    private String roleBody(String name) {
        return "{\"name\":\"" + name + "\"}";
    }
}
