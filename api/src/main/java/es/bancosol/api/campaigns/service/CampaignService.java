package es.bancosol.api.campaigns.service;

import java.time.Instant;
import es.bancosol.api.campaigns.dto.CampaignRequest;
import es.bancosol.api.campaigns.dto.CampaignResponse;
import es.bancosol.api.campaigns.entity.Campaign;
import es.bancosol.api.campaigns.entity.CampaignType;
import es.bancosol.api.campaigns.repository.CampaignRepository;
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
public class CampaignService {
    private final CampaignRepository repository;
    private final CampaignTypeRepository campaignTypeRepository;

    public Page<CampaignResponse> list(String name, Integer campaignTypeId, Pageable pageable) {
        String search = name == null ? "" : name;
        Page<Campaign> campaigns = campaignTypeId == null
                ? repository.findByNameContainingIgnoreCase(search, pageable)
                : repository.findByNameContainingIgnoreCaseAndCampaignTypeId(search, campaignTypeId, pageable);
        return campaigns.map(CampaignResponse::from);
    }

    public CampaignResponse get(Integer campaignId) {
        return CampaignResponse.from(findCampaign(campaignId));
    }

    @Transactional
    public CampaignResponse create(CampaignRequest request) {
        validateDates(request);
        CampaignType campaignType = findCampaignType(request.campaignTypeId());
        return CampaignResponse.from(repository.save(new Campaign(
                campaignType, request.name(), request.startDate(), request.endDate())));
    }

    @Transactional
    public CampaignResponse update(Integer campaignId, CampaignRequest request) {
        validateDates(request);
        Campaign campaign = findCampaign(campaignId);
        CampaignType campaignType = findCampaignType(request.campaignTypeId());
        campaign.setCampaignType(campaignType);
        campaign.setName(request.name());
        campaign.setStartDate(request.startDate());
        campaign.setEndDate(request.endDate());
        return CampaignResponse.from(campaign);
    }

    @Transactional
    public void delete(Integer campaignId) {
        findCampaign(campaignId).setDeletedAt(Instant.now());
    }

    private Campaign findCampaign(Integer campaignId) {
        return repository.findById(campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private CampaignType findCampaignType(Integer campaignTypeId) {
        return campaignTypeRepository.findById(campaignTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private void validateDates(CampaignRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
    }
}
