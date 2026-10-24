package es.bancosol.api.stores.schedule;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;
import es.bancosol.api.stores.chain.entity.Chain;
import es.bancosol.api.stores.chain.repository.ChainRepository;
import es.bancosol.api.stores.schedule.entity.Schedule;
import es.bancosol.api.stores.schedule.repository.ScheduleRepository;
import es.bancosol.api.stores.store.entity.Store;
import es.bancosol.api.stores.store.repository.StoreRepository;
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
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ScheduleIntegrationTests {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ScheduleRepository repository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private ChainRepository chainRepository;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void createsMultipleSlotsAndListsEveryDayInOrder() throws Exception {
        Store store = store();
        create(store, 1, "14:00", "18:00");
        create(store, 1, "10:00", "14:00");
        create(store, 7, "09:00", "12:00");
        mockMvc.perform(get(path(store))).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(7))
                .andExpect(jsonPath("$[0].slots.length()").value(2))
                .andExpect(jsonPath("$[0].slots[0].openingTime", startsWith("10:00")))
                .andExpect(jsonPath("$[0].slots[1].openingTime", startsWith("14:00")))
                .andExpect(jsonPath("$[6].slots.length()").value(1));
        for (int weekDay = 1; weekDay <= 7; weekDay++) {
            mockMvc.perform(get(path(store))).andExpect(jsonPath("$[" + (weekDay - 1) + "].weekDay").value(weekDay));
        }
        for (int dayIndex = 1; dayIndex < 6; dayIndex++) {
            mockMvc.perform(get(path(store))).andExpect(jsonPath("$[" + dayIndex + "].slots").isEmpty());
        }
    }

    @Test
    void emptyStoreReturnsSevenClosedDays() throws Exception {
        mockMvc.perform(get(path(store()))).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(7))
                .andExpect(jsonPath("$[*].slots[*]").isEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = {"09:00,11:00", "11:00,13:00", "10:00,12:00", "09:00,13:00"})
    void rejectsOverlapsOnCreateAndUpdate(String times) throws Exception {
        Store store = store();
        slot(store, 1, "10:00", "12:00");
        Schedule editable = slot(store, 2, "14:00", "18:00");
        String[] range = times.split(",");
        String payload = body(1, range[0], range[1]);
        mockMvc.perform(post(path(store)).contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isConflict());
        mockMvc.perform(put(path(store) + "/" + editable.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isConflict());
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT week_day FROM schedules WHERE id = ?", Integer.class,
                editable.getId())).isEqualTo(2);
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "\"weekDay\":null", "\"weekDay\":0", "\"weekDay\":8",
            "\"openingTime\":null", "\"closingTime\":null", "\"closingTime\":\"10:00\"",
            "\"closingTime\":\"09:00\""})
    void rejectsInvalidFieldsOnCreateAndUpdate(String invalidField) throws Exception {
        Store store = store();
        Schedule schedule = slot(store, 1, "10:00", "12:00");
        String payload = body(1, "10:00", "12:00");
        if (invalidField.equals("{}")) {
            payload = invalidField;
        } else {
            String field = invalidField.substring(0, invalidField.indexOf(':'));
            payload = payload.replaceAll(field + ":[^,}]+", invalidField);
        }
        mockMvc.perform(post(path(store)).contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest());
        mockMvc.perform(put(path(store) + "/" + schedule.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(payload)).andExpect(status().isBadRequest());
    }

    @Test
    void updatesWithoutSelfConflictAndMovesToAnotherDay() throws Exception {
        Store store = store();
        Schedule schedule = slot(store, 1, "10:00", "12:00");
        slot(store, 1, "14:00", "18:00");
        slot(store(), 2, "10:00", "12:00");
        mockMvc.perform(put(path(store) + "/" + schedule.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(body(1, "10:00", "14:00"))).andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(schedule.getId()));
        mockMvc.perform(put(path(store) + "/" + schedule.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(body(2, "10:00", "14:00"))).andExpect(status().isOk())
                .andExpect(jsonPath("$.weekDay").value(2));
        entityManager.flush();
        assertThat(jdbcTemplate.queryForMap("SELECT week_day, opening_time, closing_time FROM schedules WHERE id = ?",
                schedule.getId())).containsEntry("week_day", 2)
                .containsEntry("opening_time", java.sql.Time.valueOf("10:00:00"))
                .containsEntry("closing_time", java.sql.Time.valueOf("14:00:00"));
    }

    @Test
    void softDeletesAndReusesDeletedSlot() throws Exception {
        Store store = store();
        Schedule schedule = slot(store, 1, "10:00", "12:00");
        mockMvc.perform(delete(path(store) + "/" + schedule.getId())).andExpect(status().isNoContent());
        entityManager.flush();
        assertThat(jdbcTemplate.queryForMap("SELECT created_at, updated_at, deleted_at FROM schedules WHERE id = ?",
                schedule.getId())).doesNotContainValue(null);
        entityManager.clear();
        mockMvc.perform(get(path(store))).andExpect(status().isOk()).andExpect(jsonPath("$[0].slots").isEmpty());
        create(store, 1, "10:00", "12:00");
        mockMvc.perform(put(path(store) + "/" + schedule.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(body(1, "14:00", "18:00"))).andExpect(status().isNotFound());
        mockMvc.perform(delete(path(store) + "/" + schedule.getId())).andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void rejectsMissingOrDeletedStoreForEveryOperation(boolean deleted) throws Exception {
        Store store = store();
        Integer scheduleId = -1;
        if (deleted) {
            scheduleId = slot(store, 1, "10:00", "12:00").getId();
            store.setDeletedAt(Instant.now());
        } else {
            storeRepository.delete(store);
        }
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(get(path(store))).andExpect(status().isNotFound());
        mockMvc.perform(post(path(store)).contentType(MediaType.APPLICATION_JSON).content(body(1, "14:00", "18:00")))
                .andExpect(status().isNotFound());
        mockMvc.perform(put(path(store) + "/" + scheduleId).contentType(MediaType.APPLICATION_JSON)
                        .content(body(1, "14:00", "18:00"))).andExpect(status().isNotFound());
        mockMvc.perform(delete(path(store) + "/" + scheduleId)).andExpect(status().isNotFound());
    }

    @Test
    void rejectsScheduleFromAnotherStoreOrMissingSchedule() throws Exception {
        Store store = store();
        Schedule other = slot(store(), 1, "10:00", "12:00");
        for (Integer scheduleId : new Integer[]{other.getId(), -1}) {
            mockMvc.perform(put(path(store) + "/" + scheduleId).contentType(MediaType.APPLICATION_JSON)
                            .content(body(1, "14:00", "18:00"))).andExpect(status().isNotFound());
            mockMvc.perform(delete(path(store) + "/" + scheduleId)).andExpect(status().isNotFound());
        }
    }

    private Store store() {
        String name = UUID.randomUUID().toString();
        Chain chain = chainRepository.save(new Chain(name));
        return storeRepository.save(new Store(name, "Address", 0, chain));
    }

    private Schedule slot(Store store, int weekDay, String opening, String closing) {
        return repository.save(new Schedule(store, weekDay, LocalTime.parse(opening), LocalTime.parse(closing)));
    }

    private void create(Store store, int weekDay, String opening, String closing) throws Exception {
        mockMvc.perform(post(path(store)).contentType(MediaType.APPLICATION_JSON).content(body(weekDay, opening, closing)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.weekDay").value(weekDay))
                .andExpect(jsonPath("$.openingTime", startsWith(opening)))
                .andExpect(jsonPath("$.closingTime", startsWith(closing)));
    }

    private String path(Store store) {
        return "/stores/" + store.getId() + "/schedules";
    }

    private String body(int weekDay, String opening, String closing) {
        return "{\"weekDay\":" + weekDay + ",\"openingTime\":\"" + opening + "\",\"closingTime\":\"" + closing + "\"}";
    }
}
