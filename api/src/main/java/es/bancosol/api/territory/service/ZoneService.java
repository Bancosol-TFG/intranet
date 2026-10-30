package es.bancosol.api.territory.service;

import java.time.Instant;
import es.bancosol.api.territory.dto.ZoneRequest;
import es.bancosol.api.territory.dto.ZoneResponse;
import es.bancosol.api.territory.entity.Zone;
import es.bancosol.api.territory.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ZoneService {
    private final ZoneRepository repository;

    public Page<ZoneResponse> list(String name, String code, Pageable pageable) {
        return repository.search(normalizeFilter(name), normalizeFilter(code), pageable).map(ZoneResponse::from);
    }

    public ZoneResponse get(Integer zoneId) {
        return ZoneResponse.from(findZone(zoneId));
    }

    @Transactional
    public ZoneResponse create(ZoneRequest request) {
        checkDuplicate(repository.existsByName(request.name()));
        try {
            return ZoneResponse.from(repository.saveAndFlush(new Zone(request.name(), request.code())));
        } catch (DataIntegrityViolationException exception) {
            throw duplicateName(exception);
        }
    }

    @Transactional
    public ZoneResponse update(Integer zoneId, ZoneRequest request) {
        Zone zone = repository.findForUpdate(zoneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        checkDuplicate(repository.existsByNameAndIdNot(request.name(), zoneId));
        zone.setName(request.name());
        zone.setCode(request.code());
        try {
            repository.flush();
            return ZoneResponse.from(zone);
        } catch (DataIntegrityViolationException exception) {
            throw duplicateName(exception);
        }
    }

    @Transactional
    public void delete(Integer zoneId) {
        Zone zone = repository.findForUpdate(zoneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        zone.setDeletedAt(Instant.now());
    }

    private Zone findZone(Integer zoneId) {
        return repository.findById(zoneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private String normalizeFilter(String filter) {
        return filter == null || filter.isBlank() ? "" : filter;
    }

    private void checkDuplicate(boolean duplicate) {
        if (duplicate) throw duplicateName(null);
    }

    private ResponseStatusException duplicateName(Throwable cause) {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una zona con ese nombre.", cause);
    }
}
