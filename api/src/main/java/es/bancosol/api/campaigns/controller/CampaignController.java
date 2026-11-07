package es.bancosol.api.campaigns.controller;

import es.bancosol.api.campaigns.dto.CampaignRequest;
import es.bancosol.api.campaigns.dto.CampaignResponse;
import es.bancosol.api.campaigns.service.CampaignService;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.common.security.RequiresPermission;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campaigns")
@RequiredArgsConstructor
public class CampaignController {
    private final CampaignService service;

    @GetMapping
    @RequiresPermission(PermissionCode.CAMPAIGN_LIST)
    public PagedModel<CampaignResponse> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer campaignTypeId,
            Pageable pageable) {
        return new PagedModel<>(service.list(name, campaignTypeId, pageable));
    }

    @GetMapping("/{campaignId}")
    @RequiresPermission(PermissionCode.CAMPAIGN_READ)
    public CampaignResponse get(@PathVariable Integer campaignId) {
        return service.get(campaignId);
    }

    @PostMapping
    @RequiresPermission(PermissionCode.CAMPAIGN_CREATE)
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignResponse create(@Valid @RequestBody CampaignRequest request) {
        return service.create(request);
    }

    @PutMapping("/{campaignId}")
    @RequiresPermission(PermissionCode.CAMPAIGN_UPDATE)
    public CampaignResponse update(@PathVariable Integer campaignId, @Valid @RequestBody CampaignRequest request) {
        return service.update(campaignId, request);
    }

    @DeleteMapping("/{campaignId}")
    @RequiresPermission(PermissionCode.CAMPAIGN_DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer campaignId) {
        service.delete(campaignId);
    }
}
