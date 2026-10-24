package es.bancosol.api.stores.schedule.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import es.bancosol.api.stores.schedule.dto.ScheduleExceptionRequest;
import es.bancosol.api.stores.schedule.dto.ScheduleExceptionResponse;
import es.bancosol.api.stores.schedule.entity.ScheduleException;
import es.bancosol.api.stores.schedule.repository.ScheduleExceptionRepository;
import es.bancosol.api.stores.store.entity.Store;
import es.bancosol.api.stores.store.service.StoreService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleExceptionService {
    private final ScheduleExceptionRepository repository;
    private final StoreService storeService;
    private final EntityManager entityManager;

    public Page<ScheduleExceptionResponse> list(Integer storeId, LocalDate from, LocalDate to, Pageable pageable) {
        storeService.findStore(storeId);
        if (from != null && to != null && from.isAfter(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        return repository.findAll((root, query, builder) -> {
            var predicates = new ArrayList<Predicate>();
            predicates.add(builder.equal(root.get("store").get("id"), storeId));
            if (from != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("date"), from));
            }
            if (to != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("date"), to));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        }, pageable).map(ScheduleExceptionResponse::from);
    }

    @Transactional
    public ScheduleExceptionResponse create(Integer storeId, ScheduleExceptionRequest request) {
        Store store = lockStore(storeId);
        checkConflict(storeId, request, -1);
        return ScheduleExceptionResponse.from(repository.save(new ScheduleException(store, request.date(),
                request.closed(), request.openingTime(), request.closingTime())));
    }

    @Transactional
    public ScheduleExceptionResponse update(Integer storeId, Integer exceptionId, ScheduleExceptionRequest request) {
        lockStore(storeId);
        ScheduleException exception = findException(storeId, exceptionId);
        checkConflict(storeId, request, exceptionId);
        exception.setDate(request.date());
        exception.setClosed(request.closed());
        exception.setOpeningTime(request.openingTime());
        exception.setClosingTime(request.closingTime());
        return ScheduleExceptionResponse.from(exception);
    }

    @Transactional
    public void delete(Integer storeId, Integer exceptionId) {
        lockStore(storeId);
        findException(storeId, exceptionId).setDeletedAt(Instant.now());
    }

    private Store lockStore(Integer storeId) {
        Store store = storeService.findStore(storeId);
        entityManager.refresh(store, LockModeType.PESSIMISTIC_WRITE);
        if (store.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return store;
    }

    private ScheduleException findException(Integer storeId, Integer exceptionId) {
        return repository.findByIdAndStoreId(exceptionId, storeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private void checkConflict(Integer storeId, ScheduleExceptionRequest request, Integer excludedId) {
        boolean conflict = repository.findByStoreIdAndDateOrderByOpeningTimeAsc(storeId, request.date()).stream()
                .filter(exception -> !exception.getId().equals(excludedId))
                .anyMatch(exception -> request.closed() || exception.isClosed()
                        || (exception.getOpeningTime().isBefore(request.closingTime())
                        && exception.getClosingTime().isAfter(request.openingTime())));
        if (conflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
    }
}
