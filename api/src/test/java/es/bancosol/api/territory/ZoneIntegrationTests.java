package es.bancosol.api.territory;

import java.util.UUID;
import es.bancosol.api.territory.entity.Zone;
import es.bancosol.api.territory.repository.ZoneRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ZoneIntegrationTests {
    @Autowired private MockMvc mockMvc;
    @Autowired private ZoneRepository repository;
    @Autowired private EntityManager entityManager;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Test
    void createsReadsUpdatesAndDeletesZone() throws Exception {
        String name = uniqueValue();
        String code = uniqueValue();
        String response = mockMvc.perform(post("/zones").contentType(MediaType.APPLICATION_JSON)
                        .content(body(name, code)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value(name)).andExpect(jsonPath("$.code").value(code))
                .andReturn().getResponse().getContentAsString();
        Integer zoneId = com.jayway.jsonpath.JsonPath.read(response, "$.id");
        mockMvc.perform(get("/zones/{zoneId}", zoneId)).andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(name));
        String updatedName = uniqueValue();
        mockMvc.perform(put("/zones/{zoneId}", zoneId).contentType(MediaType.APPLICATION_JSON)
                        .content(body(updatedName, code)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value(updatedName));
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT name FROM zones WHERE id = ?", String.class, zoneId))
                .isEqualTo(updatedName);
        mockMvc.perform(delete("/zones/{zoneId}", zoneId)).andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        assertThat(jdbcTemplate.queryForObject("SELECT deleted_at FROM zones WHERE id = ?", java.sql.Timestamp.class,
                zoneId)).isNotNull();
        mockMvc.perform(get("/zones/{zoneId}", zoneId)).andExpect(status().isNotFound());
        mockMvc.perform(delete("/zones/{zoneId}", zoneId)).andExpect(status().isNotFound());
    }

    @Test
    void filtersByPartialNameAndCodeIgnoringCaseAndPaginates() throws Exception {
        String token = uniqueValue();
        repository.save(new Zone("North" + token + "End", "Code" + token));
        repository.save(new Zone("Elsewhere", "Other"));
        repository.save(new Zone("Second" + token, "Code" + token));
        mockMvc.perform(get("/zones").param("name", token.toUpperCase()).param("code", token.toLowerCase())
                        .param("page", "0").param("size", "1").param("sort", "name,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()" ).value(1))
                .andExpect(jsonPath("$.page.totalElements").value(2)).andExpect(jsonPath("$.page.totalPages").value(2));
    }

    @Test
    void rejectsDuplicateNamesButAllowsDuplicateCodesAndUnchangedName() throws Exception {
        String name = uniqueValue();
        String original = mockMvc.perform(post("/zones").contentType(MediaType.APPLICATION_JSON)
                        .content(body(name, "shared")))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Integer originalId = com.jayway.jsonpath.JsonPath.read(original, "$.id");
        String second = mockMvc.perform(post("/zones").contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueValue(), "shared")))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Integer secondId = com.jayway.jsonpath.JsonPath.read(second, "$.id");
        mockMvc.perform(put("/zones/{zoneId}", originalId).contentType(MediaType.APPLICATION_JSON)
                        .content(body(name, "updated-code")))
                .andExpect(status().isOk());
        mockMvc.perform(post("/zones").contentType(MediaType.APPLICATION_JSON).content(body(name, "another")))
                .andExpect(status().isConflict());
        mockMvc.perform(put("/zones/{zoneId}", secondId).contentType(MediaType.APPLICATION_JSON)
                        .content(body(name, "shared")))
                .andExpect(status().isConflict());
        mockMvc.perform(put("/zones/{zoneId}", secondId).contentType(MediaType.APPLICATION_JSON)
                        .content(body(com.jayway.jsonpath.JsonPath.read(second, "$.name"), uniqueValue())))
                .andExpect(status().isOk());
    }

    @Test
    void deletedNameRemainsReservedByGlobalUniqueConstraint() throws Exception {
        String name = uniqueValue();
        String response = mockMvc.perform(post("/zones").contentType(MediaType.APPLICATION_JSON).content(body(name, "X")))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Integer zoneId = com.jayway.jsonpath.JsonPath.read(response, "$.id");
        mockMvc.perform(delete("/zones/{zoneId}", zoneId)).andExpect(status().isNoContent());
        mockMvc.perform(post("/zones").contentType(MediaType.APPLICATION_JSON).content(body(name, "Y")))
                .andExpect(status().isConflict());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"name\":null,\"code\":\"A\"}",
            "{\"name\":\"\",\"code\":\"A\"}", "{\"name\":\"Town\",\"code\":\"   \"}"})
    void rejectsMissingOrBlankRequiredValues(String payload) throws Exception {
        mockMvc.perform(post("/zones").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsNotFoundForUnknownZone() throws Exception {
        mockMvc.perform(get("/zones/{zoneId}", 987654321)).andExpect(status().isNotFound());
        mockMvc.perform(put("/zones/{zoneId}", 987654321).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Name", "Code"))).andExpect(status().isNotFound());
        mockMvc.perform(delete("/zones/{zoneId}", 987654321)).andExpect(status().isNotFound());
    }

    private String uniqueValue() {
        return UUID.randomUUID().toString();
    }

    private String body(String name, String code) {
        return "{\"name\":\"" + name + "\",\"code\":\"" + code + "\"}";
    }
}
