package es.bancosol.api.stores;

import java.util.UUID;
import es.bancosol.api.stores.entity.Chain;
import es.bancosol.api.stores.repository.ChainRepository;
import es.bancosol.api.common.security.WithAllPermissions;
import es.bancosol.api.stores.entity.Store;
import es.bancosol.api.stores.repository.StoreRepository;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithAllPermissions
class ChainIntegrationTests {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ChainRepository repository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private LocalityRepository localityRepository;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void createsAndListsChainWithName() throws Exception {
        String code = uniqueCode();
        mockMvc.perform(post("/chains").contentType(MediaType.APPLICATION_JSON).content(body(code)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.code").value(code))
                .andExpect(jsonPath("$.name").value("Test chain"));
        mockMvc.perform(get("/chains").param("code", code))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].code").value(code))
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Test chain"));
    }

    @Test
    void paginatesAndSortsMatchingChains() throws Exception {
        String prefix = uniqueCode();
        repository.save(new Chain("Test chain", prefix + "a"));
        repository.save(new Chain("Test chain", prefix + "c"));
        repository.save(new Chain("Test chain", prefix + "b"));
        mockMvc.perform(get("/chains").param("code", prefix).param("page", "0").param("size", "2")
                        .param("sort", "code,desc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].code").value(prefix + "c"))
                .andExpect(jsonPath("$.content[1].code").value(prefix + "b"))
                .andExpect(jsonPath("$.page.totalElements").value(3));
    }

    @Test
    void filtersByPartialCodeIgnoringCase() throws Exception {
        String token = uniqueCode();
        repository.save(new Chain("Test chain", "before" + token + "AFTER"));
        repository.save(new Chain("Test chain", uniqueCode()));
        mockMvc.perform(get("/chains").param("code", token.toUpperCase()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].code").value("before" + token + "AFTER"));
    }

    @Test
    void readsAndUpdatesChain() throws Exception {
        Chain chain = repository.save(new Chain("Test chain", uniqueCode()));
        mockMvc.perform(get("/chains/{chainId}", chain.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(chain.getId()))
                .andExpect(jsonPath("$.code").value(chain.getCode()));
        String updatedCode = uniqueCode();
        mockMvc.perform(put("/chains/{chainId}", chain.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(body(updatedCode).replace("Test chain", "Carrefour")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value(updatedCode))
                .andExpect(jsonPath("$.name").value("Carrefour"));
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT code FROM chains WHERE id = ?", String.class,
                chain.getId())).isEqualTo(updatedCode);
        mockMvc.perform(put("/chains/{chainId}", chain.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(body(updatedCode))).andExpect(status().isOk());
    }

    @Test
    void rejectsDuplicateCodesOnCreateAndUpdate() throws Exception {
        Chain original = repository.save(new Chain("Test chain", uniqueCode()));
        Chain other = repository.save(new Chain("Test chain", uniqueCode()));
        mockMvc.perform(post("/chains").contentType(MediaType.APPLICATION_JSON).content(body(original.getCode())))
                .andExpect(status().isConflict());
        mockMvc.perform(put("/chains/{chainId}", other.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(body(original.getCode()))).andExpect(status().isConflict());
        assertThat(other.getCode()).isNotEqualTo(original.getCode());
    }

    @Test
    void allowsRepeatedNamesWithDifferentCodes() throws Exception {
        String firstCode = uniqueCode();
        String secondCode = uniqueCode();
        mockMvc.perform(post("/chains").contentType(MediaType.APPLICATION_JSON).content(body(firstCode)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.name").value("Test chain"));
        mockMvc.perform(post("/chains").contentType(MediaType.APPLICATION_JSON).content(body(secondCode)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.name").value("Test chain"))
                .andExpect(jsonPath("$.code").value(secondCode));
    }

    @ParameterizedTest
    @ValueSource(strings = {"null", "\"\"", "\"   \""})
    void rejectsNullOrBlankName(String name) throws Exception {
        String payload = "{\"name\":" + name + ",\"code\":\"" + uniqueCode() + "\"}";
        mockMvc.perform(post("/chains").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
        Chain chain = repository.save(new Chain("Test chain", uniqueCode()));
        mockMvc.perform(put("/chains/{chainId}", chain.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isBadRequest());
    }

    @Test
    void rejectsMissingName() throws Exception {
        String payload = "{\"code\":\"" + uniqueCode() + "\"}";
        mockMvc.perform(post("/chains").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
        Chain chain = repository.save(new Chain("Test chain", uniqueCode()));
        mockMvc.perform(put("/chains/{chainId}", chain.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{\"name\":\"Test chain\"}", "{\"name\":\"Test chain\",\"code\":null}",
            "{\"name\":\"Test chain\",\"code\":\"\"}", "{\"name\":\"Test chain\",\"code\":\"   \"}"})
    void rejectsMissingOrBlankCode(String payload) throws Exception {
        mockMvc.perform(post("/chains").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
        Chain chain = repository.save(new Chain("Test chain", uniqueCode()));
        mockMvc.perform(put("/chains/{chainId}", chain.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void rejectsMissingAndDeletedChains(boolean deleted) throws Exception {
        Chain chain = repository.save(new Chain("Test chain", uniqueCode()));
        Integer chainId = chain.getId();
        if (deleted) {
            mockMvc.perform(delete("/chains/{chainId}", chainId)).andExpect(status().isNoContent());
        } else {
            repository.delete(chain);
        }
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(get("/chains/{chainId}", chainId)).andExpect(status().isNotFound());
        mockMvc.perform(put("/chains/{chainId}", chainId).contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueCode()))).andExpect(status().isNotFound());
        mockMvc.perform(delete("/chains/{chainId}", chainId)).andExpect(status().isNotFound());
    }

    @Test
    void softDeletesChainAndAllowsReusingCode() throws Exception {
        String code = uniqueCode();
        Chain chain = repository.save(new Chain("Test chain", code));
        mockMvc.perform(delete("/chains/{chainId}", chain.getId())).andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        assertThat(jdbcTemplate.queryForObject("SELECT deleted_at FROM chains WHERE id = ?", java.sql.Timestamp.class,
                chain.getId())).isNotNull();
        assertThat(jdbcTemplate.queryForMap("SELECT created_at, updated_at FROM chains WHERE id = ?",
                chain.getId())).doesNotContainValue(null);
        mockMvc.perform(get("/chains").param("code", code)).andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(0));
        mockMvc.perform(get("/chains/{chainId}", chain.getId())).andExpect(status().isNotFound());
        mockMvc.perform(post("/chains").contentType(MediaType.APPLICATION_JSON).content(body(code)))
                .andExpect(status().isCreated());
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM chains WHERE code = ?", Integer.class, code))
                .isEqualTo(2);
        mockMvc.perform(get("/chains").param("code", code)).andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void blocksDeletionUntilAllStoresAreSoftDeleted() throws Exception {
        Chain chain = repository.save(new Chain("Test chain", uniqueCode()));
        Locality locality = localityRepository.save(new Locality(uniqueCode(), "29001"));
        Store first = storeRepository.save(new Store(uniqueCode(), "Address", 0, chain, locality));
        Store second = storeRepository.save(new Store(uniqueCode(), "Address", 1, chain, locality));
        mockMvc.perform(delete("/chains/{chainId}", chain.getId())).andExpect(status().isConflict());
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT deleted_at FROM chains WHERE id = ?", java.sql.Timestamp.class,
                chain.getId())).isNull();
        mockMvc.perform(get("/chains/{chainId}", chain.getId())).andExpect(status().isOk());
        mockMvc.perform(delete("/stores/{storeId}", first.getId())).andExpect(status().isNoContent());
        mockMvc.perform(delete("/chains/{chainId}", chain.getId())).andExpect(status().isConflict());
        mockMvc.perform(delete("/stores/{storeId}", second.getId())).andExpect(status().isNoContent());
        mockMvc.perform(delete("/chains/{chainId}", chain.getId())).andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        assertThat(jdbcTemplate.queryForObject("SELECT deleted_at FROM chains WHERE id = ?", java.sql.Timestamp.class,
                chain.getId())).isNotNull();
        mockMvc.perform(get("/chains/{chainId}", chain.getId())).andExpect(status().isNotFound());
    }

    private String uniqueCode() {
        return UUID.randomUUID().toString();
    }

    private String body(String code) {
        return "{\"name\":\"Test chain\",\"code\":\"" + code + "\"}";
    }
}
