package es.bancosol.api.stores.store.controller;

import es.bancosol.api.stores.store.dto.StoreRequest;
import es.bancosol.api.stores.store.dto.StoreResponse;
import es.bancosol.api.stores.store.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
public class StoreController {
    private final StoreService service;

    @GetMapping
    public PagedModel<StoreResponse> list(@RequestParam(required = false) Integer chainId,
                                         @RequestParam(required = false) String name, Pageable pageable) {
        return new PagedModel<>(service.list(chainId, name, pageable));
    }

    @GetMapping("/{storeId}")
    public StoreResponse get(@PathVariable Integer storeId) {
        return service.get(storeId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StoreResponse create(@Valid @RequestBody StoreRequest request) {
        return service.create(request);
    }

    @PutMapping("/{storeId}")
    public StoreResponse update(@PathVariable Integer storeId, @Valid @RequestBody StoreRequest request) {
        return service.update(storeId, request);
    }

    @DeleteMapping("/{storeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer storeId) {
        service.delete(storeId);
    }
}
