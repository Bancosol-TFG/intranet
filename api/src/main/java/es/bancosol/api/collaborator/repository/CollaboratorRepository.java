package es.bancosol.api.collaborator.repository;

import java.util.Optional;
import es.bancosol.api.collaborator.entity.Collaborator;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CollaboratorRepository extends JpaRepository<Collaborator, Integer> {
    @Query("SELECT collaborator FROM Collaborator collaborator WHERE "
            + "(:name IS NULL OR LOWER(collaborator.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND "
            + "(:localityId IS NULL OR collaborator.locality.id = :localityId)")
    Page<Collaborator> search(
            @Param("name") String name,
            @Param("localityId") Integer localityId,
            Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT collaborator FROM Collaborator collaborator WHERE collaborator.id = :collaboratorId")
    Optional<Collaborator> findForUpdate(@Param("collaboratorId") Integer collaboratorId);

    boolean existsByLocalityId(Integer localityId);
}
