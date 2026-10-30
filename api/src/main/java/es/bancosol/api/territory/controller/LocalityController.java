package es.bancosol.api.territory.controller;

import es.bancosol.api.territory.dto.LocalityRequest;
import es.bancosol.api.territory.dto.LocalityResponse;
import es.bancosol.api.territory.service.LocalityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/localities")
@RequiredArgsConstructor
public class LocalityController {
    private final LocalityService service;

    @GetMapping
    public PagedModel<LocalityResponse> list(@RequestParam(required = false) String name,
                                             @RequestParam(required = false) String postalCode,
                                             Pageable pageable) {
        return new PagedModel<>(service.list(name, postalCode, pageable));
    }

    @GetMapping("/{localityId}")
    public LocalityResponse get(@PathVariable Integer localityId) {
        return service.get(localityId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LocalityResponse create(@Valid @RequestBody LocalityRequest request) {
        return service.create(request);
    }

    @PutMapping("/{localityId}")
    public LocalityResponse update(@PathVariable Integer localityId, @Valid @RequestBody LocalityRequest request) {
        return service.update(localityId, request);
    }

    @DeleteMapping("/{localityId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer localityId) {
        service.delete(localityId);
    }
}
