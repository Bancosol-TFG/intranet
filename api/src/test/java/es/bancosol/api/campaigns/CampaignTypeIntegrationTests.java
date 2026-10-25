package es.bancosol.api.campaigns;

import java.util.UUID;
import es.bancosol.api.campaigns.entity.CampaignType;
import es.bancosol.api.campaigns.repository.CampaignTypeRepository;
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
class CampaignTypeIntegrationTests {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private CampaignTypeRepository repository;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void createsAndListsCampaignTypeWithoutCredentials() throws Exception {
        String name = uniqueName();
        mockMvc.perform(post("/campaign-types").contentType(MediaType.APPLICATION_JSON).content(body(name)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value(name));
        mockMvc.perform(get("/campaign-types").param("name", name))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].name").value(name))
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void paginatesAndSortsMatchingCampaignTypes() throws Exception {
        String prefix = uniqueName();
        repository.save(new CampaignType(prefix + "a"));
        repository.save(new CampaignType(prefix + "c"));
        repository.save(new CampaignType(prefix + "b"));
        mockMvc.perform(get("/campaign-types").param("name", prefix).param("page", "0").param("size", "2")
                        .param("sort", "name,desc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].name").value(prefix + "c"))
                .andExpect(jsonPath("$.content[1].name").value(prefix + "b"))
                .andExpect(jsonPath("$.page.totalElements").value(3));
    }

    @Test
    void filtersByPartialNameIgnoringCase() throws Exception {
        String token = uniqueName();
        repository.save(new CampaignType("before" + token + "AFTER"));
        repository.save(new CampaignType(uniqueName()));
        mockMvc.perform(get("/campaign-types").param("name", token.toUpperCase()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].name").value("before" + token + "AFTER"));
    }

    @Test
    void readsAndUpdatesCampaignType() throws Exception {
        CampaignType campaignType = repository.save(new CampaignType(uniqueName()));
        mockMvc.perform(get("/campaign-types/{campaignTypeId}", campaignType.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(campaignType.getId()))
                .andExpect(jsonPath("$.name").value(campaignType.getName()));
        String updatedName = uniqueName();
        mockMvc.perform(put("/campaign-types/{campaignTypeId}", campaignType.getId())
                        .contentType(MediaType.APPLICATION_JSON).content(body(updatedName)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value(updatedName));
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT name FROM campaign_types WHERE id = ?", String.class,
                campaignType.getId())).isEqualTo(updatedName);
        mockMvc.perform(put("/campaign-types/{campaignTypeId}", campaignType.getId())
                        .contentType(MediaType.APPLICATION_JSON).content(body(updatedName)))
                .andExpect(status().isOk());
    }

    @Test
    void rejectsDuplicateNamesOnCreateAndUpdate() throws Exception {
        CampaignType original = repository.save(new CampaignType(uniqueName()));
        CampaignType other = repository.save(new CampaignType(uniqueName()));
        mockMvc.perform(post("/campaign-types").contentType(MediaType.APPLICATION_JSON)
                        .content(body(original.getName())))
                .andExpect(status().isConflict());
        mockMvc.perform(put("/campaign-types/{campaignTypeId}", other.getId())
                        .contentType(MediaType.APPLICATION_JSON).content(body(original.getName())))
                .andExpect(status().isConflict());
        assertThat(other.getName()).isNotEqualTo(original.getName());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"name\":null}", "{\"name\":\"\"}", "{\"name\":\"   \"}"})
    void rejectsMissingOrBlankName(String payload) throws Exception {
        mockMvc.perform(post("/campaign-types").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
        CampaignType campaignType = repository.save(new CampaignType(uniqueName()));
        mockMvc.perform(put("/campaign-types/{campaignTypeId}", campaignType.getId())
                        .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void rejectsMissingAndDeletedCampaignTypes(boolean deleted) throws Exception {
        CampaignType campaignType = repository.save(new CampaignType(uniqueName()));
        Integer campaignTypeId = campaignType.getId();
        if (deleted) {
            mockMvc.perform(delete("/campaign-types/{campaignTypeId}", campaignTypeId))
                    .andExpect(status().isNoContent());
        } else {
            repository.delete(campaignType);
        }
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(get("/campaign-types/{campaignTypeId}", campaignTypeId)).andExpect(status().isNotFound());
        mockMvc.perform(put("/campaign-types/{campaignTypeId}", campaignTypeId)
                        .contentType(MediaType.APPLICATION_JSON).content(body(uniqueName())))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/campaign-types/{campaignTypeId}", campaignTypeId))
                .andExpect(status().isNotFound());
    }

    @Test
    void softDeletesCampaignTypeAndAllowsReusingName() throws Exception {
        String name = uniqueName();
        CampaignType campaignType = repository.save(new CampaignType(name));
        mockMvc.perform(delete("/campaign-types/{campaignTypeId}", campaignType.getId()))
                .andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        assertThat(jdbcTemplate.queryForObject("SELECT deleted_at FROM campaign_types WHERE id = ?",
                java.sql.Timestamp.class, campaignType.getId())).isNotNull();
        assertThat(jdbcTemplate.queryForMap("SELECT created_at, updated_at FROM campaign_types WHERE id = ?",
                campaignType.getId())).doesNotContainValue(null);
        mockMvc.perform(get("/campaign-types").param("name", name)).andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(0));
        mockMvc.perform(get("/campaign-types/{campaignTypeId}", campaignType.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/campaign-types").contentType(MediaType.APPLICATION_JSON).content(body(name)))
                .andExpect(status().isCreated());
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM campaign_types WHERE name = ?",
                Integer.class, name)).isEqualTo(2);
        mockMvc.perform(get("/campaign-types").param("name", name)).andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    private String uniqueName() {
        return UUID.randomUUID().toString();
    }

    private String body(String name) {
        return "{\"name\":\"" + name + "\"}";
    }
}
