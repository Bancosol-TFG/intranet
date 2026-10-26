package es.bancosol.api.territory.service;

import java.time.Instant;
import es.bancosol.api.territory.dto.LocalityRequest;
import es.bancosol.api.territory.dto.LocalityResponse;
import es.bancosol.api.territory.entity.Locality;
import es.bancosol.api.territory.repository.LocalityRepository;
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
public class LocalityService {
    private final LocalityRepository repository;

    public Page<LocalityResponse> list(String name, String postalCode, Pageable pageable) {
        return repository.search(normalizeFilter(name), normalizeFilter(postalCode), pageable)
                .map(LocalityResponse::from);
    }

    public LocalityResponse get(Integer localityId) {
        return LocalityResponse.from(findLocality(localityId));
    }

    @Transactional
    public LocalityResponse create(LocalityRequest request) {
        return LocalityResponse.from(repository.save(new Locality(request.name(), request.postalCode())));
    }

    @Transactional
    public LocalityResponse update(Integer localityId, LocalityRequest request) {
        Locality locality = repository.findForUpdate(localityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        locality.setName(request.name());
        locality.setPostalCode(request.postalCode());
        return LocalityResponse.from(locality);
    }

    @Transactional
    public void delete(Integer localityId) {
        Locality locality = repository.findForUpdate(localityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        locality.setDeletedAt(Instant.now());
    }

    private Locality findLocality(Integer localityId) {
        return repository.findById(localityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private String normalizeFilter(String filter) {
        return filter == null || filter.isBlank() ? "" : filter;
    }
}
