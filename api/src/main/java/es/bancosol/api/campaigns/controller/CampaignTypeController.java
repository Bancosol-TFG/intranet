package es.bancosol.api.campaigns.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.bancosol.api.campaigns.dto.CampaignTypeRequest;
import es.bancosol.api.campaigns.dto.CampaignTypeResponse;
import es.bancosol.api.campaigns.service.CampaignTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

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
