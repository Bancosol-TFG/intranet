package es.bancosol.api.stores.store;

import java.time.Instant;
import java.util.UUID;
import es.bancosol.api.stores.chain.entity.Chain;
import es.bancosol.api.stores.chain.repository.ChainRepository;
import es.bancosol.api.stores.store.entity.Store;
import es.bancosol.api.stores.store.repository.StoreRepository;
import es.bancosol.api.stores.store.service.StoreService;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class StoreIntegrationTests {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private StoreRepository repository;
    @Autowired
    private ChainRepository chainRepository;
    @Autowired
    private StoreService service;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void createsAndListsStoreLinkedToChain() throws Exception {
        Chain chain = chain();
        String name = uniqueName();
        mockMvc.perform(post("/stores").contentType(MediaType.APPLICATION_JSON).content(body(name, chain.getId())))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value(name)).andExpect(jsonPath("$.address").value("Address"))
                .andExpect(jsonPath("$.checkoutShelfs").value(0))
                .andExpect(jsonPath("$.chain.id").value(chain.getId()))
                .andExpect(jsonPath("$.chain.code").value(chain.getCode()));
        mockMvc.perform(get("/stores").param("chainId", chain.getId().toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].name").value(name))
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void paginatesSortsAndCombinesFilters() throws Exception {
        Chain chain = chain();
        String prefix = uniqueName();
        store(prefix + "a", chain);
        store(prefix + "c", chain);
        store(prefix + "b", chain);
        store(prefix + "d", chain());
        store(uniqueName(), chain);
        mockMvc.perform(get("/stores").param("chainId", chain.getId().toString())
                        .param("name", prefix.toUpperCase()).param("page", "1").param("size", "2")
                        .param("sort", "name,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].name").value(prefix + "c"))
                .andExpect(jsonPath("$.page.size").value(2)).andExpect(jsonPath("$.page.number").value(1))
                .andExpect(jsonPath("$.page.totalElements").value(3))
                .andExpect(jsonPath("$.page.totalPages").value(2));
        mockMvc.perform(get("/stores").param("name", prefix.toUpperCase()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(4))
                .andExpect(jsonPath("$.page.totalElements").value(4));
        mockMvc.perform(get("/stores").param("chainId", chain.getId().toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page.totalElements").value(4));
    }

    @Test
    void readsAndUpdatesStoreIncludingChain() throws Exception {
        Store store = store(uniqueName(), chain());
        Chain target = chain();
        mockMvc.perform(get("/stores/{storeId}", store.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(store.getId()))
                .andExpect(jsonPath("$.name").value(store.getName()));
        String name = uniqueName();
        String payload = body(name, target.getId()).replace("Address", "New address")
                .replace("\"checkoutShelfs\":0", "\"checkoutShelfs\":5");
        mockMvc.perform(put("/stores/{storeId}", store.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isOk()).andExpect(jsonPath("$.name").value(name))
                .andExpect(jsonPath("$.address").value("New address"))
                .andExpect(jsonPath("$.checkoutShelfs").value(5))
                .andExpect(jsonPath("$.chain.id").value(target.getId()));
        entityManager.flush();
        assertThat(jdbcTemplate.queryForMap("SELECT name, address, checkout_shelfs, chain_id FROM stores WHERE id = ?",
                store.getId())).containsEntry("name", name).containsEntry("address", "New address")
                .containsEntry("checkout_shelfs", 5).containsEntry("chain_id", target.getId());
        mockMvc.perform(put("/stores/{storeId}", store.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isOk());
        assertThat(service.findStore(store.getId()).getId()).isEqualTo(store.getId());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void rejectsMissingOrDeletedChainWithoutSaving(boolean deleted) throws Exception {
        Store existing = store(uniqueName(), chain());
        Chain invalid = chain();
        if (deleted) {
            invalid.setDeletedAt(Instant.now());
        } else {
            chainRepository.delete(invalid);
        }
        entityManager.flush();
        entityManager.clear();
        String rejectedName = uniqueName();
        String payload = body(rejectedName, invalid.getId());
        mockMvc.perform(post("/stores").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
        mockMvc.perform(put("/stores/{storeId}", existing.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isBadRequest());
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM stores WHERE name = ?", Integer.class,
                rejectedName)).isZero();
        assertThat(jdbcTemplate.queryForMap("SELECT name, address, checkout_shelfs, chain_id FROM stores WHERE id = ?",
                existing.getId())).containsEntry("name", existing.getName()).containsEntry("address", "Address")
                .containsEntry("checkout_shelfs", 0).containsEntry("chain_id", existing.getChain().getId());
    }

    @Test
    void rejectsDuplicateNameOnCreateAndUpdate() throws Exception {
        Store original = store(uniqueName(), chain());
        Store other = store(uniqueName(), chain());
        String payload = body(original.getName(), other.getChain().getId());
        mockMvc.perform(post("/stores").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isConflict());
        mockMvc.perform(put("/stores/{storeId}", other.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isConflict());
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM stores WHERE name = ?", Integer.class,
                original.getName())).isEqualTo(1);
        assertThat(jdbcTemplate.queryForObject("SELECT name FROM stores WHERE id = ?", String.class,
                other.getId())).isEqualTo(other.getName());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "\"name\":null", "\"name\":\"\"", "\"name\":\"   \"",
            "\"address\":null", "\"address\":\"\"", "\"address\":\"   \"",
            "\"checkoutShelfs\":null", "\"checkoutShelfs\":-1", "\"chainId\":null"})
    void rejectsInvalidFieldsOnCreateAndUpdate(String invalidField) throws Exception {
        Store existing = store(uniqueName(), chain());
        String payload = body(uniqueName(), existing.getChain().getId());
        if (invalidField.equals("{}")) {
            payload = invalidField;
        } else {
            String field = invalidField.substring(0, invalidField.indexOf(':'));
            payload = payload.replaceAll(field + ":[^,}]+", invalidField);
        }
        mockMvc.perform(post("/stores").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
        mockMvc.perform(put("/stores/{storeId}", existing.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void rejectsMissingOrDeletedStore(boolean deleted) throws Exception {
        Store store = store(uniqueName(), chain());
        if (deleted) {
            mockMvc.perform(delete("/stores/{storeId}", store.getId())).andExpect(status().isNoContent());
        } else {
            repository.delete(store);
        }
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(get("/stores/{storeId}", store.getId())).andExpect(status().isNotFound());
        mockMvc.perform(put("/stores/{storeId}", store.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueName(), store.getChain().getId()))).andExpect(status().isNotFound());
        mockMvc.perform(delete("/stores/{storeId}", store.getId())).andExpect(status().isNotFound());
        assertThatThrownBy(() -> service.findStore(store.getId()))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                .extracting("statusCode").isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }

    @Test
    void softDeletesStoreAndAllowsReusingName() throws Exception {
        Store store = store(uniqueName(), chain());
        mockMvc.perform(delete("/stores/{storeId}", store.getId())).andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        assertThat(jdbcTemplate.queryForObject("SELECT deleted_at FROM stores WHERE id = ?", java.sql.Timestamp.class,
                store.getId())).isNotNull();
        assertThat(jdbcTemplate.queryForMap("SELECT created_at, updated_at FROM stores WHERE id = ?", store.getId()))
                .doesNotContainValue(null);
        mockMvc.perform(get("/stores").param("name", store.getName())).andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(0));
        mockMvc.perform(get("/stores/{storeId}", store.getId())).andExpect(status().isNotFound());
        mockMvc.perform(post("/stores").contentType(MediaType.APPLICATION_JSON)
                        .content(body(store.getName(), store.getChain().getId()))).andExpect(status().isCreated());
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM stores WHERE name = ?", Integer.class,
                store.getName())).isEqualTo(2);
    }

    private Chain chain() {
        return chainRepository.save(new Chain(uniqueName()));
    }

    private Store store(String name, Chain chain) {
        return repository.save(new Store(name, "Address", 0, chain));
    }

    private String uniqueName() {
        return UUID.randomUUID().toString();
    }

    private String body(String name, Integer chainId) {
        return "{\"name\":\"" + name + "\",\"address\":\"Address\",\"checkoutShelfs\":0,\"chainId\":" + chainId + "}";
    }
}
