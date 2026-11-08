package es.bancosol.api.campaigns.repository;

import es.bancosol.api.campaigns.entity.CampaignType;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CampaignTypeRepository extends JpaRepository<CampaignType, Integer> {
    Page<CampaignType> findByNameContainingIgnoreCase(String name, Pageable pageable);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT campaignType FROM CampaignType campaignType WHERE campaignType.id = :campaignTypeId")
    Optional<CampaignType> findForUpdate(@Param("campaignTypeId") Integer campaignTypeId);
}
