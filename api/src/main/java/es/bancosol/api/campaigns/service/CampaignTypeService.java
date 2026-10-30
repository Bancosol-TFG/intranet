package es.bancosol.api.campaigns.service;

import java.time.Instant;
import es.bancosol.api.campaigns.dto.CampaignTypeRequest;
import es.bancosol.api.campaigns.dto.CampaignTypeResponse;
import es.bancosol.api.campaigns.entity.CampaignType;
import es.bancosol.api.campaigns.repository.CampaignTypeRepository;
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
public class CampaignTypeService {
    private final CampaignTypeRepository repository;

    public Page<CampaignTypeResponse> list(String name, Pageable pageable) {
        return repository.findByNameContainingIgnoreCase(name == null ? "" : name, pageable)
                .map(CampaignTypeResponse::from);
    }

    public CampaignTypeResponse get(Integer campaignTypeId) {
        return CampaignTypeResponse.from(findCampaignType(campaignTypeId));
    }

    @Transactional
    public CampaignTypeResponse create(CampaignTypeRequest request) {
        checkDuplicate(repository.existsByName(request.name()));
        return CampaignTypeResponse.from(repository.save(new CampaignType(request.name())));
    }

    @Transactional
    public CampaignTypeResponse update(Integer campaignTypeId, CampaignTypeRequest request) {
        CampaignType campaignType = findCampaignType(campaignTypeId);
        checkDuplicate(repository.existsByNameAndIdNot(request.name(), campaignTypeId));
        campaignType.setName(request.name());
        return CampaignTypeResponse.from(campaignType);
    }

    @Transactional
    public void delete(Integer campaignTypeId) {
        findCampaignType(campaignTypeId).setDeletedAt(Instant.now());
    }

    private CampaignType findCampaignType(Integer campaignTypeId) {
        return repository.findById(campaignTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private void checkDuplicate(boolean duplicate) {
        if (duplicate) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
    }
}
