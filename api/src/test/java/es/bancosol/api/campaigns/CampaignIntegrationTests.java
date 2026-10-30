package es.bancosol.api.campaigns;

import java.time.LocalDate;
import java.util.UUID;
import es.bancosol.api.campaigns.entity.Campaign;
import es.bancosol.api.campaigns.entity.CampaignType;
import es.bancosol.api.campaigns.repository.CampaignRepository;
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
class CampaignIntegrationTests {
    private static final LocalDate START_DATE = LocalDate.of(2026, 11, 2);
    private static final LocalDate END_DATE = LocalDate.of(2026, 11, 20);

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private CampaignRepository repository;
    @Autowired
    private CampaignTypeRepository campaignTypeRepository;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void createsAndListsCampaignWithoutCredentials() throws Exception {
        CampaignType campaignType = createCampaignType();
        String name = uniqueName();
        mockMvc.perform(post("/campaigns").contentType(MediaType.APPLICATION_JSON)
                        .content(body(name, campaignType.getId(), START_DATE, END_DATE)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value(name))
                .andExpect(jsonPath("$.campaignTypeId").value(campaignType.getId()))
                .andExpect(jsonPath("$.campaignTypeName").value(campaignType.getName()))
                .andExpect(jsonPath("$.startDate").value("2026-11-02"))
                .andExpect(jsonPath("$.endDate").value("2026-11-20"));
        mockMvc.perform(get("/campaigns").param("name", name).param("campaignTypeId", campaignType.getId().toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].name").value(name))
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void paginatesAndSortsMatchingCampaigns() throws Exception {
        CampaignType campaignType = createCampaignType();
        String prefix = uniqueName();
        repository.save(new Campaign(campaignType, prefix + "a", START_DATE, END_DATE));
        repository.save(new Campaign(campaignType, prefix + "c", START_DATE, END_DATE));
        repository.save(new Campaign(campaignType, prefix + "b", START_DATE, END_DATE));
        mockMvc.perform(get("/campaigns").param("name", prefix).param("page", "0").param("size", "2")
                        .param("sort", "name,desc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].name").value(prefix + "c"))
                .andExpect(jsonPath("$.content[1].name").value(prefix + "b"))
                .andExpect(jsonPath("$.page.totalElements").value(3));
    }

    @Test
    void filtersByNameAndCampaignType() throws Exception {
        CampaignType firstType = createCampaignType();
        CampaignType secondType = createCampaignType();
        String token = uniqueName();
        repository.save(new Campaign(firstType, "before" + token + "AFTER", START_DATE, END_DATE));
        repository.save(new Campaign(secondType, "before" + token + "AFTER", START_DATE, END_DATE));
        mockMvc.perform(get("/campaigns").param("name", token.toUpperCase())
                        .param("campaignTypeId", secondType.getId().toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].campaignTypeId").value(secondType.getId()));
    }

    @Test
    void readsAndUpdatesCampaign() throws Exception {
        CampaignType originalType = createCampaignType();
        CampaignType updatedType = createCampaignType();
        Campaign campaign = repository.save(new Campaign(originalType, uniqueName(), START_DATE, END_DATE));
        mockMvc.perform(get("/campaigns/{campaignId}", campaign.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(campaign.getId()))
                .andExpect(jsonPath("$.campaignTypeId").value(originalType.getId()));
        String updatedName = uniqueName();
        LocalDate updatedStartDate = LocalDate.of(2027, 1, 10);
        LocalDate updatedEndDate = LocalDate.of(2027, 1, 15);
        mockMvc.perform(put("/campaigns/{campaignId}", campaign.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(updatedName, updatedType.getId(), updatedStartDate, updatedEndDate)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value(updatedName))
                .andExpect(jsonPath("$.campaignTypeId").value(updatedType.getId()))
                .andExpect(jsonPath("$.startDate").value("2027-01-10"))
                .andExpect(jsonPath("$.endDate").value("2027-01-15"));
        entityManager.flush();
        assertThat(jdbcTemplate.queryForMap("SELECT name, campaign_type_id, start_date, end_date FROM campaigns WHERE id = ?",
                campaign.getId()))
                .containsEntry("name", updatedName)
                .containsEntry("campaign_type_id", updatedType.getId())
                .containsEntry("start_date", java.sql.Date.valueOf(updatedStartDate))
                .containsEntry("end_date", java.sql.Date.valueOf(updatedEndDate));
    }

    @Test
    void acceptsCampaignsStartingAndEndingOnTheSameDay() throws Exception {
        CampaignType campaignType = createCampaignType();
        mockMvc.perform(post("/campaigns").contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueName(), campaignType.getId(), START_DATE, START_DATE)))
                .andExpect(status().isCreated());
    }

    @Test
    void rejectsEndDateBeforeStartDateOnCreateAndUpdate() throws Exception {
        CampaignType campaignType = createCampaignType();
        String invalidPayload = body(uniqueName(), campaignType.getId(), END_DATE, START_DATE);
        mockMvc.perform(post("/campaigns").contentType(MediaType.APPLICATION_JSON).content(invalidPayload))
                .andExpect(status().isBadRequest());
        Campaign campaign = repository.save(new Campaign(campaignType, uniqueName(), START_DATE, END_DATE));
        mockMvc.perform(put("/campaigns/{campaignId}", campaign.getId())
                        .contentType(MediaType.APPLICATION_JSON).content(invalidPayload))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{}",
            "{\"name\":null,\"campaignTypeId\":1,\"startDate\":\"2026-11-02\",\"endDate\":\"2026-11-20\"}",
            "{\"name\":\"\",\"campaignTypeId\":1,\"startDate\":\"2026-11-02\",\"endDate\":\"2026-11-20\"}",
            "{\"name\":\"   \",\"campaignTypeId\":1,\"startDate\":\"2026-11-02\",\"endDate\":\"2026-11-20\"}",
            "{\"name\":\"Campaña\",\"startDate\":\"2026-11-02\",\"endDate\":\"2026-11-20\"}",
            "{\"name\":\"Campaña\",\"campaignTypeId\":1,\"endDate\":\"2026-11-20\"}",
            "{\"name\":\"Campaña\",\"campaignTypeId\":1,\"startDate\":\"2026-11-02\"}"
    })
    void rejectsMissingOrInvalidFields(String payload) throws Exception {
        mockMvc.perform(post("/campaigns").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
        CampaignType campaignType = createCampaignType();
        Campaign campaign = repository.save(new Campaign(campaignType, uniqueName(), START_DATE, END_DATE));
        mockMvc.perform(put("/campaigns/{campaignId}", campaign.getId())
                        .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void rejectsMissingAndDeletedCampaignType(boolean deleted) throws Exception {
        CampaignType campaignType = createCampaignType();
        Integer campaignTypeId = campaignType.getId();
        if (deleted) {
            mockMvc.perform(delete("/campaign-types/{campaignTypeId}", campaignTypeId))
                    .andExpect(status().isNoContent());
        } else {
            campaignTypeRepository.delete(campaignType);
        }
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(post("/campaigns").contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueName(), campaignTypeId, START_DATE, END_DATE)))
                .andExpect(status().isNotFound());
        CampaignType otherType = createCampaignType();
        Campaign campaign = repository.save(new Campaign(otherType, uniqueName(), START_DATE, END_DATE));
        mockMvc.perform(put("/campaigns/{campaignId}", campaign.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueName(), campaignTypeId, START_DATE, END_DATE)))
                .andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void rejectsMissingAndDeletedCampaigns(boolean deleted) throws Exception {
        CampaignType campaignType = createCampaignType();
        Campaign campaign = repository.save(new Campaign(campaignType, uniqueName(), START_DATE, END_DATE));
        Integer campaignId = campaign.getId();
        if (deleted) {
            mockMvc.perform(delete("/campaigns/{campaignId}", campaignId)).andExpect(status().isNoContent());
        } else {
            repository.delete(campaign);
        }
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(get("/campaigns/{campaignId}", campaignId)).andExpect(status().isNotFound());
        mockMvc.perform(put("/campaigns/{campaignId}", campaignId).contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueName(), campaignType.getId(), START_DATE, END_DATE)))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/campaigns/{campaignId}", campaignId)).andExpect(status().isNotFound());
    }

    @Test
    void softDeletesCampaign() throws Exception {
        CampaignType campaignType = createCampaignType();
        String name = uniqueName();
        Campaign campaign = repository.save(new Campaign(campaignType, name, START_DATE, END_DATE));
        mockMvc.perform(delete("/campaigns/{campaignId}", campaign.getId()))
                .andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        assertThat(jdbcTemplate.queryForObject("SELECT deleted_at FROM campaigns WHERE id = ?",
                java.sql.Timestamp.class, campaign.getId())).isNotNull();
        assertThat(jdbcTemplate.queryForMap("SELECT created_at, updated_at FROM campaigns WHERE id = ?",
                campaign.getId())).doesNotContainValue(null);
        mockMvc.perform(get("/campaigns").param("name", name)).andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(0));
        mockMvc.perform(get("/campaigns/{campaignId}", campaign.getId())).andExpect(status().isNotFound());
    }

    @Test
    void rejectsDeletingCampaignTypeInUse() throws Exception {
        CampaignType campaignType = createCampaignType();
        Campaign campaign = repository.save(new Campaign(campaignType, uniqueName(), START_DATE, END_DATE));
        mockMvc.perform(delete("/campaign-types/{campaignTypeId}", campaignType.getId()))
                .andExpect(status().isConflict());
        mockMvc.perform(delete("/campaigns/{campaignId}", campaign.getId())).andExpect(status().isNoContent());
        mockMvc.perform(delete("/campaign-types/{campaignTypeId}", campaignType.getId()))
                .andExpect(status().isNoContent());
    }

    private CampaignType createCampaignType() {
        return campaignTypeRepository.save(new CampaignType(uniqueName()));
    }

    private String uniqueName() {
        return UUID.randomUUID().toString();
    }

    private String body(String name, Integer campaignTypeId, LocalDate startDate, LocalDate endDate) {
        return "{\"name\":\"" + name + "\",\"campaignTypeId\":" + campaignTypeId
                + ",\"startDate\":\"" + startDate + "\",\"endDate\":\"" + endDate + "\"}";
    }
}
