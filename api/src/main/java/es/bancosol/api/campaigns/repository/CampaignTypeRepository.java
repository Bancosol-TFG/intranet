package es.bancosol.api.campaigns.repository;

import es.bancosol.api.campaigns.entity.CampaignType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignTypeRepository extends JpaRepository<CampaignType, Integer> {
    Page<CampaignType> findByNameContainingIgnoreCase(String name, Pageable pageable);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Integer id);
}
