package es.bancosol.api.territory.repository;

import java.util.Optional;
import es.bancosol.api.territory.entity.Locality;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LocalityRepository extends JpaRepository<Locality, Integer> {
    @Query("SELECT locality FROM Locality locality WHERE " +
            "(:name IS NULL OR LOWER(locality.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:postalCode IS NULL OR LOWER(locality.postalCode) LIKE LOWER(CONCAT('%', :postalCode, '%')))")
    Page<Locality> search(@Param("name") String name, @Param("postalCode") String postalCode, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT locality FROM Locality locality WHERE locality.id = :localityId")
    Optional<Locality> findForUpdate(@Param("localityId") Integer localityId);
}
