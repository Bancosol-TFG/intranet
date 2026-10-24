package es.bancosol.api.stores.schedule.service;

import java.time.LocalDate;
import es.bancosol.api.stores.schedule.dto.EffectiveScheduleResponse;
import es.bancosol.api.stores.schedule.dto.EffectiveScheduleResponse.Slot;
import es.bancosol.api.stores.schedule.dto.EffectiveScheduleResponse.Source;
import es.bancosol.api.stores.schedule.repository.ScheduleExceptionRepository;
import es.bancosol.api.stores.schedule.repository.ScheduleRepository;
import es.bancosol.api.stores.store.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EffectiveScheduleService {
    private final ScheduleExceptionRepository exceptionRepository;
    private final ScheduleRepository scheduleRepository;
    private final StoreService storeService;

    public EffectiveScheduleResponse get(Integer storeId, LocalDate date) {
        storeService.findStore(storeId);
        var exceptions = exceptionRepository.findByStoreIdAndDateOrderByOpeningTimeAsc(storeId, date);
        if (!exceptions.isEmpty()) {
            var slots = exceptions.stream().filter(exception -> !exception.isClosed())
                    .map(exception -> new Slot(exception.getOpeningTime(), exception.getClosingTime())).toList();
            return new EffectiveScheduleResponse(storeId, date, Source.EXCEPTION, slots.isEmpty(), slots);
        }
        var slots = scheduleRepository.findByStoreIdOrderByWeekDayAscOpeningTimeAsc(storeId).stream()
                .filter(schedule -> schedule.getWeekDay() == date.getDayOfWeek().getValue())
                .map(schedule -> new Slot(schedule.getOpeningTime(), schedule.getClosingTime())).toList();
        return new EffectiveScheduleResponse(storeId, date, Source.WEEKLY, slots.isEmpty(), slots);
    }
}
