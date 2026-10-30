package es.bancosol.api.territory.repository;

import java.util.Optional;
import es.bancosol.api.territory.entity.Zone;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ZoneRepository extends JpaRepository<Zone, Integer> {
    @Query("SELECT zone FROM Zone zone WHERE " +
            "(:name IS NULL OR LOWER(zone.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:code IS NULL OR LOWER(zone.code) LIKE LOWER(CONCAT('%', :code, '%'))) ")
    Page<Zone> search(@Param("name") String name, @Param("code") String code, Pageable pageable);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT zone FROM Zone zone WHERE zone.id = :zoneId")
    Optional<Zone> findForUpdate(@Param("zoneId") Integer zoneId);
}
