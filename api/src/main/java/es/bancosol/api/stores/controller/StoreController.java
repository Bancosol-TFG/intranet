package es.bancosol.api.stores.controller;

import es.bancosol.api.stores.dto.StoreRequest;
import es.bancosol.api.stores.dto.StoreResponse;
import es.bancosol.api.stores.service.StoreService;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.common.security.RequiresPermission;
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
    @RequiresPermission(PermissionCode.STORE_LIST)
    public PagedModel<StoreResponse> list(@RequestParam(required = false) Integer chainId,
                                         @RequestParam(required = false) Integer zoneId,
                                         @RequestParam(required = false) Integer localityId,
                                         @RequestParam(required = false) String name, Pageable pageable) {
        return new PagedModel<>(service.list(chainId, zoneId, localityId, name, pageable));
    }

    @GetMapping("/{storeId}")
    @RequiresPermission(PermissionCode.STORE_READ)
    public StoreResponse get(@PathVariable Integer storeId) {
        return service.get(storeId);
    }

    @PostMapping
    @RequiresPermission(PermissionCode.STORE_CREATE)
    @ResponseStatus(HttpStatus.CREATED)
    public StoreResponse create(@Valid @RequestBody StoreRequest request) {
        return service.create(request);
    }

    @PutMapping("/{storeId}")
    @RequiresPermission(PermissionCode.STORE_UPDATE)
    public StoreResponse update(@PathVariable Integer storeId, @Valid @RequestBody StoreRequest request) {
        return service.update(storeId, request);
    }

    @DeleteMapping("/{storeId}")
    @RequiresPermission(PermissionCode.STORE_DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer storeId) {
        service.delete(storeId);
    }
}
