package es.bancosol.api.territory;

import java.util.UUID;
import es.bancosol.api.territory.entity.Locality;
import es.bancosol.api.territory.repository.LocalityRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@WithMockUser
@AutoConfigureMockMvc
@Transactional
class LocalityIntegrationTests {
    @Autowired private MockMvc mockMvc;
    @Autowired private LocalityRepository repository;
    @Autowired private EntityManager entityManager;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Test
    void createsReadsAndUpdatesLocality() throws Exception {
        String name = uniqueValue();
        String postalCode = uniqueValue();
        String response = mockMvc.perform(post("/localities").contentType(MediaType.APPLICATION_JSON)
                        .content(body(name, postalCode)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value(name)).andExpect(jsonPath("$.postalCode").value(postalCode))
                .andReturn().getResponse().getContentAsString();
        Integer localityId = com.jayway.jsonpath.JsonPath.read(response, "$.id");
        mockMvc.perform(get("/localities/{localityId}", localityId)).andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(name));
        String updatedName = uniqueValue();
        mockMvc.perform(put("/localities/{localityId}", localityId).contentType(MediaType.APPLICATION_JSON)
                        .content(body(updatedName, postalCode)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value(updatedName));
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT name FROM localities WHERE id = ?", String.class, localityId))
                .isEqualTo(updatedName);
    }

    @Test
    void filtersByPartialNameAndPostalCodeIgnoringCaseAndPaginates() throws Exception {
        String token = uniqueValue();
        repository.save(new Locality("Town" + token + "End", "CP" + token));
        repository.save(new Locality("Elsewhere", "Other"));
        repository.save(new Locality("Second" + token, "CP" + token));
        mockMvc.perform(get("/localities").param("name", token.toUpperCase())
                        .param("postalCode", token.toLowerCase()).param("page", "0").param("size", "1")
                        .param("sort", "name,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.page.totalElements").value(2)).andExpect(jsonPath("$.page.totalPages").value(2));
    }

    @Test
    void softDeletesLocalityAndHidesItFromQueries() throws Exception {
        Locality locality = repository.save(new Locality(uniqueValue(), uniqueValue()));
        Integer localityId = locality.getId();
        mockMvc.perform(delete("/localities/{localityId}", localityId)).andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        assertThat(jdbcTemplate.queryForObject("SELECT deleted_at FROM localities WHERE id = ?", java.sql.Timestamp.class,
                localityId)).isNotNull();
        assertThat(jdbcTemplate.queryForMap("SELECT created_at, updated_at FROM localities WHERE id = ?", localityId))
                .doesNotContainValue(null);
        mockMvc.perform(get("/localities").param("name", locality.getName()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page.totalElements").value(0));
        mockMvc.perform(get("/localities/{localityId}", localityId)).andExpect(status().isNotFound());
        mockMvc.perform(put("/localities/{localityId}", localityId).contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueValue(), uniqueValue())))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/localities/{localityId}", localityId)).andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"name\":null,\"postalCode\":\"123\"}",
            "{\"name\":\"\",\"postalCode\":\"123\"}", "{\"name\":\"Town\",\"postalCode\":\"   \"}"})
    void rejectsMissingOrBlankRequiredValues(String payload) throws Exception {
        mockMvc.perform(post("/localities").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
        Locality locality = repository.save(new Locality(uniqueValue(), uniqueValue()));
        mockMvc.perform(put("/localities/{localityId}", locality.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsNotFoundForAnUnknownLocality() throws Exception {
        mockMvc.perform(get("/localities/{localityId}", 987654321)).andExpect(status().isNotFound());
        mockMvc.perform(put("/localities/{localityId}", 987654321).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Town", "00123")))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/localities/{localityId}", 987654321)).andExpect(status().isNotFound());
    }

    @Test
    void preservesLeadingZeroesAndAllowsDuplicateLocalities() throws Exception {
        String localityBody = body("Small Town", "00123");
        String first = mockMvc.perform(post("/localities").contentType(MediaType.APPLICATION_JSON).content(localityBody))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.postalCode").value("00123"))
                .andReturn().getResponse().getContentAsString();
        String second = mockMvc.perform(post("/localities").contentType(MediaType.APPLICATION_JSON).content(localityBody))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.postalCode").value("00123"))
                .andReturn().getResponse().getContentAsString();
        Integer firstId = com.jayway.jsonpath.JsonPath.read(first, "$.id");
        Integer secondId = com.jayway.jsonpath.JsonPath.read(second, "$.id");
        assertThat(firstId).isNotEqualTo(secondId);
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM localities WHERE name = ? AND postal_code = ?",
                Integer.class, "Small Town", "00123")).isEqualTo(2);
    }

    private String uniqueValue() {
        return UUID.randomUUID().toString();
    }

    private String body(String name, String postalCode) {
        return "{\"name\":\"" + name + "\",\"postalCode\":\"" + postalCode + "\"}";
    }
}
