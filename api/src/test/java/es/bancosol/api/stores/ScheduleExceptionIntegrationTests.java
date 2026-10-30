package es.bancosol.api.stores;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import es.bancosol.api.stores.entity.Chain;
import es.bancosol.api.stores.repository.ChainRepository;
import es.bancosol.api.stores.entity.Schedule;
import es.bancosol.api.stores.entity.ScheduleException;
import es.bancosol.api.stores.repository.ScheduleExceptionRepository;
import es.bancosol.api.stores.repository.ScheduleRepository;
import es.bancosol.api.stores.entity.Store;
import es.bancosol.api.stores.repository.StoreRepository;
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
class ScheduleExceptionIntegrationTests {
    private static final LocalDate DATE = LocalDate.of(2031, 5, 12);

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ScheduleExceptionRepository repository;
    @Autowired
    private ScheduleRepository scheduleRepository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private ChainRepository chainRepository;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void createsAdjacentSlotsAndPaginatesWithInclusiveFiltersAndDefaultOrder() throws Exception {
        Store store = store();
        create(store, body(DATE, false, "14:00", "18:00"));
        create(store, body(DATE, false, "10:00", "14:00"));
        slot(store, DATE.minusDays(1), false, "09:00", "11:00");
        slot(store, DATE.plusDays(1), true, null, null);
        slot(store(), DATE, true, null, null);
        mockMvc.perform(get(path(store)).param("from", DATE.toString()).param("to", DATE.toString())
                        .param("size", "1").param("page", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].openingTime", startsWith("14:00")))
                .andExpect(jsonPath("$.page.size").value(1)).andExpect(jsonPath("$.page.number").value(1))
                .andExpect(jsonPath("$.page.totalElements").value(2)).andExpect(jsonPath("$.page.totalPages").value(2));
        mockMvc.perform(get(path(store))).andExpect(jsonPath("$.page.totalElements").value(4))
                .andExpect(jsonPath("$.content[0].date").value(DATE.minusDays(1).toString()));
        mockMvc.perform(get(path(store)).param("from", DATE.toString()))
                .andExpect(jsonPath("$.page.totalElements").value(3));
        mockMvc.perform(get(path(store)).param("to", DATE.toString()))
                .andExpect(jsonPath("$.page.totalElements").value(3));
        mockMvc.perform(get(path(store)).param("from", DATE.plusDays(1).toString()).param("to", DATE.toString()))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {"09:00,11:00", "11:00,13:00", "10:00,12:00", "09:00,13:00"})
    void rejectsOverlapsOnCreateAndEdit(String times) throws Exception {
        Store store = store();
        slot(store, DATE, false, "10:00", "12:00");
        ScheduleException editable = slot(store, DATE.plusDays(1), false, "14:00", "18:00");
        String[] range = times.split(",");
        rejectsWrites(store, editable, body(DATE, false, range[0], range[1]), 409);
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject("SELECT date FROM schedule_exceptions WHERE id = ?",
                LocalDate.class, editable.getId())).isEqualTo(DATE.plusDays(1));
    }

    @Test
    void rejectsClosureWithOpenSlotsAndEditingTowardClosure() throws Exception {
        Store store = store();
        slot(store, DATE, false, "10:00", "12:00");
        ScheduleException editable = slot(store, DATE, false, "14:00", "18:00");
        rejectsWrites(store, editable, body(DATE, true, null, null), 409);
    }

    @Test
    void rejectsOpenSlotsAndSecondClosureOnClosedDate() throws Exception {
        Store store = store();
        slot(store, DATE, true, null, null);
        ScheduleException editable = slot(store, DATE.plusDays(1), false, "14:00", "18:00");
        rejectsWrites(store, editable, body(DATE, false, "10:00", "12:00"), 409);
        rejectsWrites(store, editable, body(DATE, true, null, null), 409);
    }

    @Test
    void updatesWithoutSelfConflictAndMovesDate() throws Exception {
        Store store = store();
        ScheduleException exception = slot(store, DATE, false, "10:00", "12:00");
        for (LocalDate date : new LocalDate[]{DATE, DATE.plusDays(1)}) {
            mockMvc.perform(put(path(store) + "/" + exception.getId()).contentType(MediaType.APPLICATION_JSON)
                            .content(body(date, false, "10:00", "14:00")))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(exception.getId()))
                    .andExpect(jsonPath("$.date").value(date.toString()));
        }
        mockMvc.perform(put(path(store) + "/" + exception.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content(body(DATE, true, null, null))).andExpect(status().isOk())
                .andExpect(jsonPath("$.closed").value(true)).andExpect(jsonPath("$.openingTime").isEmpty())
                .andExpect(jsonPath("$.closingTime").isEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"closed\":true}", "{\"date\":\"invalid\",\"closed\":true}",
            "{\"date\":\"2031-05-12\",\"closed\":null}",
            "{\"date\":\"2031-05-12\",\"closed\":true,\"openingTime\":\"10:00\"}",
            "{\"date\":\"2031-05-12\",\"closed\":true,\"closingTime\":\"12:00\"}",
            "{\"date\":\"2031-05-12\",\"closed\":false}",
            "{\"date\":\"2031-05-12\",\"closed\":false,\"openingTime\":\"10:00\"}",
            "{\"date\":\"2031-05-12\",\"closed\":false,\"closingTime\":\"12:00\"}",
            "{\"date\":\"2031-05-12\",\"closed\":false,\"openingTime\":\"12:00\",\"closingTime\":\"12:00\"}",
            "{\"date\":\"2031-05-12\",\"closed\":false,\"openingTime\":\"14:00\",\"closingTime\":\"12:00\"}"})
    void rejectsInconsistentBodies(String payload) throws Exception {
        Store store = store();
        rejectsWrites(store, slot(store, DATE, false, "10:00", "12:00"), payload, 400);
    }

    @Test
    void effectiveScheduleUsesOnlyExceptionsInOpeningOrder() throws Exception {
        Store store = store();
        weekly(store, DATE, "08:00", "09:00");
        slot(store, DATE, false, "14:00", "18:00");
        slot(store, DATE, false, "10:00", "12:00");
        effective(store, DATE, "EXCEPTION", false, 2);
        mockMvc.perform(get(effectivePath(store)).param("date", DATE.toString()))
                .andExpect(jsonPath("$.slots[0].openingTime", startsWith("10:00")))
                .andExpect(jsonPath("$.slots[1].openingTime", startsWith("14:00")))
                .andExpect(jsonPath("$.slots[1].closingTime", startsWith("18:00")));
    }

    @Test
    void effectiveScheduleFallsBackToWeeklyDayInOpeningOrder() throws Exception {
        Store store = store();
        weekly(store, DATE, "14:00", "18:00");
        weekly(store, DATE, "10:00", "12:00");
        weekly(store, DATE.plusDays(1), "08:00", "09:00");
        slot(store, DATE.plusDays(1), true, null, null);
        effective(store, DATE, "WEEKLY", false, 2);
        mockMvc.perform(get(effectivePath(store)).param("date", DATE.toString()))
                .andExpect(jsonPath("$.slots[0].openingTime", startsWith("10:00")))
                .andExpect(jsonPath("$.slots[1].openingTime", startsWith("14:00")));
    }

    @Test
    void effectiveScheduleIsClosedForClosureAndMissingWeeklySlots() throws Exception {
        Store store = store();
        weekly(store, DATE, "10:00", "12:00");
        create(store, body(DATE, true, null, null));
        effective(store, DATE, "EXCEPTION", true, 0);
        effective(store, DATE.plusDays(1), "WEEKLY", true, 0);
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "invalid", "2031-02-30"})
    void effectiveScheduleRequiresValidDate(String date) throws Exception {
        var request = get(effectivePath(store()));
        if (!date.isEmpty()) {
            request.param("date", date);
        }
        mockMvc.perform(request).andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void everyEndpointRejectsMissingOrDeletedStores(boolean deleted) throws Exception {
        Store store = store();
        Integer exceptionId = -1;
        if (deleted) {
            exceptionId = slot(store, DATE, true, null, null).getId();
            store.setDeletedAt(Instant.now());
        } else {
            storeRepository.delete(store);
        }
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(get(path(store))).andExpect(status().isNotFound());
        mockMvc.perform(get(effectivePath(store)).param("date", DATE.toString())).andExpect(status().isNotFound());
        mockMvc.perform(post(path(store)).contentType(MediaType.APPLICATION_JSON).content(body(DATE, true, null, null)))
                .andExpect(status().isNotFound());
        mockMvc.perform(put(path(store) + "/" + exceptionId).contentType(MediaType.APPLICATION_JSON)
                .content(body(DATE, true, null, null))).andExpect(status().isNotFound());
        mockMvc.perform(delete(path(store) + "/" + exceptionId)).andExpect(status().isNotFound());
    }

    @Test
    void rejectsForeignMissingAndDeletedExceptions() throws Exception {
        Store store = store();
        ScheduleException foreign = slot(store(), DATE, true, null, null);
        ScheduleException deleted = slot(store, DATE, true, null, null);
        deleted.setDeletedAt(Instant.now());
        entityManager.flush();
        entityManager.clear();
        for (Integer exceptionId : new Integer[]{foreign.getId(), deleted.getId(), -1}) {
            mockMvc.perform(put(path(store) + "/" + exceptionId).contentType(MediaType.APPLICATION_JSON)
                    .content(body(DATE, true, null, null))).andExpect(status().isNotFound());
            mockMvc.perform(delete(path(store) + "/" + exceptionId)).andExpect(status().isNotFound());
        }
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void deletedExceptionsNoLongerAffectConflictsOrEffectiveSchedule(boolean closed) throws Exception {
        Store store = store();
        weekly(store, DATE, "08:00", "09:00");
        ScheduleException exception = slot(store, DATE, closed, closed ? null : "10:00", closed ? null : "12:00");
        mockMvc.perform(delete(path(store) + "/" + exception.getId())).andExpect(status().isNoContent());
        entityManager.flush();
        assertThat(jdbcTemplate.queryForMap("SELECT created_at, updated_at, deleted_at FROM schedule_exceptions WHERE id = ?",
                exception.getId())).doesNotContainValue(null);
        entityManager.clear();
        mockMvc.perform(get(path(store))).andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.page.totalElements").value(0));
        effective(store, DATE, "WEEKLY", false, 1);
        create(store, body(DATE, false, "10:00", "12:00"));
        effective(store, DATE, "EXCEPTION", false, 1);
    }

    private void rejectsWrites(Store store, ScheduleException exception, String payload, int expectedStatus) throws Exception {
        mockMvc.perform(post(path(store)).contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().is(expectedStatus));
        mockMvc.perform(put(path(store) + "/" + exception.getId()).contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().is(expectedStatus));
    }

    private void effective(Store store, LocalDate date, String source, boolean closed, int slots) throws Exception {
        mockMvc.perform(get(effectivePath(store)).param("date", date.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.storeId").value(store.getId()))
                .andExpect(jsonPath("$.date").value(date.toString())).andExpect(jsonPath("$.source").value(source))
                .andExpect(jsonPath("$.closed").value(closed)).andExpect(jsonPath("$.slots.length()").value(slots));
    }

    private Store store() {
        String name = UUID.randomUUID().toString();
        return storeRepository.save(new Store(name, "Address", 0, chainRepository.save(new Chain(name))));
    }

    private ScheduleException slot(Store store, LocalDate date, boolean closed, String opening, String closing) {
        return repository.save(new ScheduleException(store, date, closed,
                opening == null ? null : LocalTime.parse(opening), closing == null ? null : LocalTime.parse(closing)));
    }

    private void weekly(Store store, LocalDate date, String opening, String closing) {
        scheduleRepository.save(new Schedule(store, date.getDayOfWeek().getValue(), LocalTime.parse(opening),
                LocalTime.parse(closing)));
    }

    private void create(Store store, String payload) throws Exception {
        mockMvc.perform(post(path(store)).contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.date").value(DATE.toString()));
    }

    private String path(Store store) {
        return "/stores/" + store.getId() + "/schedule-exceptions";
    }

    private String effectivePath(Store store) {
        return "/stores/" + store.getId() + "/schedule";
    }

    private String body(LocalDate date, boolean closed, String opening, String closing) {
        return "{\"date\":\"" + date + "\",\"closed\":" + closed + ",\"openingTime\":"
                + (opening == null ? "null" : "\"" + opening + "\"") + ",\"closingTime\":"
                + (closing == null ? "null" : "\"" + closing + "\"") + "}";
    }
}
