package es.bancosol.api.common.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@SpringBootTest
@AutoConfigureMockMvc
class ControllerPermissionIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

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
        mockMvc.perform(get("/zones")).andExpect(status().isForbidden());
    }
}
