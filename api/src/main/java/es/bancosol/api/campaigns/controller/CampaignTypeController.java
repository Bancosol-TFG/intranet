package es.bancosol.api.campaigns.controller;

import es.bancosol.api.campaigns.dto.CampaignTypeRequest;
import es.bancosol.api.campaigns.dto.CampaignTypeResponse;
import es.bancosol.api.campaigns.service.CampaignTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campaign-types")
@RequiredArgsConstructor
public class CampaignTypeController {
    private final CampaignTypeService service;

    @GetMapping
    public PagedModel<CampaignTypeResponse> list(@RequestParam(required = false) String name, Pageable pageable) {
        return new PagedModel<>(service.list(name, pageable));
    }

    @GetMapping("/{campaignTypeId}")
    public CampaignTypeResponse get(@PathVariable Integer campaignTypeId) {
        return service.get(campaignTypeId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignTypeResponse create(@Valid @RequestBody CampaignTypeRequest request) {
        return service.create(request);
    }

    @PutMapping("/{campaignTypeId}")
    public CampaignTypeResponse update(@PathVariable Integer campaignTypeId,
            @Valid @RequestBody CampaignTypeRequest request) {
        return service.update(campaignTypeId, request);
    }

    @DeleteMapping("/{campaignTypeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer campaignTypeId) {
        service.delete(campaignTypeId);
    }
}
