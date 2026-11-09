package es.bancosol.api.stores.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.HashSet;
import java.util.Objects;
import es.bancosol.api.stores.dto.ScheduleExceptionRequest;
import es.bancosol.api.stores.dto.ScheduleExceptionDayRequest;
import es.bancosol.api.stores.dto.ScheduleExceptionResponse;
import es.bancosol.api.stores.entity.ScheduleException;
import es.bancosol.api.stores.repository.ScheduleExceptionRepository;
import es.bancosol.api.stores.entity.Store;
import es.bancosol.api.stores.service.StoreService;
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

    @Transactional
    public List<ScheduleExceptionResponse> replaceDay(Integer storeId, ScheduleExceptionDayRequest request) {
        Store store = lockStore(storeId);
        validateDay(request);
        LocalDate originalDate = request.originalDate();
        List<ScheduleException> original = originalDate == null ? List.of()
                : repository.findByStoreIdAndDateOrderByOpeningTimeAsc(storeId, originalDate);
        if (!matchesExpected(original, request.expected())
                || ((originalDate == null || !originalDate.equals(request.date()))
                && !repository.findByStoreIdAndDateOrderByOpeningTimeAsc(storeId, request.date()).isEmpty())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
        var originalIds = original.stream().map(ScheduleException::getId).collect(java.util.stream.Collectors.toSet());
        var retainedIds = new HashSet<Integer>();
        for (var slot : request.slots()) {
            if (slot.id() != null && (!originalIds.contains(slot.id()) || !retainedIds.add(slot.id())
                    || original.stream().anyMatch(row -> row.getId().equals(slot.id()) && row.isClosed()))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
            }
        }
        ScheduleException closure = request.closed() ? original.stream().filter(ScheduleException::isClosed).findFirst().orElse(null) : null;
        if (closure != null) retainedIds.add(closure.getId());
        Instant deletedAt = Instant.now();
        original.stream().filter(row -> !retainedIds.contains(row.getId())).forEach(row -> row.setDeletedAt(deletedAt));
        List<ScheduleException> result = new ArrayList<>();
        if (request.closed()) {
            if (closure == null) closure = repository.save(new ScheduleException(store, request.date(), true, null, null));
            else closure.setDate(request.date());
            result.add(closure);
        } else {
            for (var slot : request.slots()) {
                ScheduleException row = slot.id() == null
                        ? repository.save(new ScheduleException(store, request.date(), false, slot.openingTime(), slot.closingTime()))
                        : original.stream().filter(item -> item.getId().equals(slot.id())).findFirst().orElseThrow();
                row.setDate(request.date());
                row.setOpeningTime(slot.openingTime());
                row.setClosingTime(slot.closingTime());
                result.add(row);
            }
        }
        return result.stream().map(ScheduleExceptionResponse::from).toList();
    }

    private void validateDay(ScheduleExceptionDayRequest request) {
        if ((request.closed() && !request.slots().isEmpty())
                || (!request.closed() && request.slots().isEmpty() && request.originalDate() == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        var sorted = request.slots().stream().sorted(java.util.Comparator.comparing(ScheduleExceptionDayRequest.Slot::openingTime)).toList();
        for (int index = 1; index < sorted.size(); index++) {
            if (sorted.get(index - 1).closingTime().isAfter(sorted.get(index).openingTime())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT);
            }
        }
    }

    private boolean matchesExpected(List<ScheduleException> original, List<ScheduleExceptionDayRequest.Expected> expected) {
        if (original.size() != expected.size()) return false;
        var expectedIds = new HashSet<Integer>();
        for (var item : expected) {
            if (!expectedIds.add(item.id()) || original.stream().noneMatch(row -> row.getId().equals(item.id())
                    && row.getDate().equals(item.date()) && row.isClosed() == item.closed()
                    && Objects.equals(row.getOpeningTime(), item.openingTime())
                    && Objects.equals(row.getClosingTime(), item.closingTime()))) return false;
        }
        return true;
    }

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
