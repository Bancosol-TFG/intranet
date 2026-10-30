package es.bancosol.api.territory.controller;

import es.bancosol.api.territory.dto.ZoneRequest;
import es.bancosol.api.territory.dto.ZoneResponse;
import es.bancosol.api.territory.service.ZoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/zones")
@RequiredArgsConstructor
public class ZoneController {
    private final ZoneService service;

    @GetMapping
    public PagedModel<ZoneResponse> list(@RequestParam(required = false) String name,
                                         @RequestParam(required = false) String code,
                                         Pageable pageable) {
        return new PagedModel<>(service.list(name, code, pageable));
    }

    @GetMapping("/{zoneId}")
    public ZoneResponse get(@PathVariable Integer zoneId) {
        return service.get(zoneId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ZoneResponse create(@Valid @RequestBody ZoneRequest request) {
        return service.create(request);
    }

    @PutMapping("/{zoneId}")
    public ZoneResponse update(@PathVariable Integer zoneId, @Valid @RequestBody ZoneRequest request) {
        return service.update(zoneId, request);
    }

    @DeleteMapping("/{zoneId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer zoneId) {
        service.delete(zoneId);
    }
}
