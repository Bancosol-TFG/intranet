package es.bancosol.api.stores.controller;

import es.bancosol.api.stores.dto.ChainRequest;
import es.bancosol.api.stores.dto.ChainResponse;
import es.bancosol.api.stores.service.ChainService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chains")
@RequiredArgsConstructor
public class ChainController {
    private final ChainService service;

    @GetMapping
    public PagedModel<ChainResponse> list(@RequestParam(required = false) String code, Pageable pageable) {
        return new PagedModel<>(service.list(code, pageable));
    }

    @GetMapping("/{chainId}")
    public ChainResponse get(@PathVariable Integer chainId) {
        return service.get(chainId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChainResponse create(@Valid @RequestBody ChainRequest request) {
        return service.create(request);
    }

    @PutMapping("/{chainId}")
    public ChainResponse update(@PathVariable Integer chainId, @Valid @RequestBody ChainRequest request) {
        return service.update(chainId, request);
    }

    @DeleteMapping("/{chainId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer chainId) {
        service.delete(chainId);
    }
}
