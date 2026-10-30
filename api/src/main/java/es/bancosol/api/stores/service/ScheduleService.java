package es.bancosol.api.stores.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.IntStream;
import es.bancosol.api.stores.dto.ScheduleDayResponse;
import es.bancosol.api.stores.dto.ScheduleRequest;
import es.bancosol.api.stores.dto.ScheduleResponse;
import es.bancosol.api.stores.entity.Schedule;
import es.bancosol.api.stores.repository.ScheduleRepository;
import es.bancosol.api.stores.entity.Store;
import es.bancosol.api.stores.service.StoreService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {
    private final ScheduleRepository repository;
    private final StoreService storeService;
    private final EntityManager entityManager;

    public List<ScheduleDayResponse> list(Integer storeId) {
        storeService.findStore(storeId);
        List<Schedule> schedules = repository.findByStoreIdOrderByWeekDayAscOpeningTimeAsc(storeId);
        return IntStream.rangeClosed(1, 7).mapToObj(weekDay -> new ScheduleDayResponse(weekDay,
                schedules.stream().filter(schedule -> schedule.getWeekDay() == weekDay)
                        .map(ScheduleDayResponse.Slot::from).toList())).toList();
    }

    @Transactional
    public ScheduleResponse create(Integer storeId, ScheduleRequest request) {
        Store store = lockStore(storeId);
        checkOverlap(storeId, request, -1);
        return ScheduleResponse.from(repository.save(new Schedule(store, request.weekDay(), request.openingTime(),
                request.closingTime())));
    }

    @Transactional
    public ScheduleResponse update(Integer storeId, Integer scheduleId, ScheduleRequest request) {
        lockStore(storeId);
        Schedule schedule = findSchedule(storeId, scheduleId);
        checkOverlap(storeId, request, scheduleId);
        schedule.setWeekDay(request.weekDay());
        schedule.setOpeningTime(request.openingTime());
        schedule.setClosingTime(request.closingTime());
        return ScheduleResponse.from(schedule);
    }

    @Transactional
    public void delete(Integer storeId, Integer scheduleId) {
        lockStore(storeId);
        findSchedule(storeId, scheduleId).setDeletedAt(Instant.now());
    }

    private Store lockStore(Integer storeId) {
        Store store = storeService.findStore(storeId);
        entityManager.refresh(store, LockModeType.PESSIMISTIC_WRITE);
        if (store.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return store;
    }

    private Schedule findSchedule(Integer storeId, Integer scheduleId) {
        return repository.findByIdAndStoreId(scheduleId, storeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private void checkOverlap(Integer storeId, ScheduleRequest request, Integer excludedId) {
        if (repository.overlaps(storeId, request.weekDay(), request.openingTime(), request.closingTime(), excludedId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
    }
}
