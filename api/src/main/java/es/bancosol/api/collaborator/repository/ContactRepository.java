package es.bancosol.api.collaborator.repository;

import java.util.List;
import java.util.Optional;
import es.bancosol.api.collaborator.entity.Contact;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContactRepository extends JpaRepository<Contact, Integer> {
    Page<Contact> findByCollaboratorId(Integer collaboratorId, Pageable pageable);

    Optional<Contact> findByIdAndCollaboratorId(Integer contactId, Integer collaboratorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT contact FROM Contact contact WHERE contact.id = :contactId "
            + "AND contact.collaborator.id = :collaboratorId")
    Optional<Contact> findForUpdate(
            @Param("contactId") Integer contactId,
            @Param("collaboratorId") Integer collaboratorId);

    @Query("SELECT contact FROM Contact contact WHERE contact.collaborator.id = :collaboratorId")
    List<Contact> findActiveByCollaboratorId(@Param("collaboratorId") Integer collaboratorId);
}
