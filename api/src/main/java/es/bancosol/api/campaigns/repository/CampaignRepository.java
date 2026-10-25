package es.bancosol.api.campaigns.repository;

import es.bancosol.api.campaigns.entity.Campaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, Integer> {
    Page<Campaign> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Campaign> findByNameContainingIgnoreCaseAndCampaignTypeId(
            String name, Integer campaignTypeId, Pageable pageable);
    boolean existsByCampaignTypeId(Integer campaignTypeId);
}
