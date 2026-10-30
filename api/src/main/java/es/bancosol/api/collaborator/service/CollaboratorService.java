package es.bancosol.api.collaborator.service;

import java.time.Instant;
import es.bancosol.api.collaborator.dto.CollaboratorRequest;
import es.bancosol.api.collaborator.dto.CollaboratorResponse;
import es.bancosol.api.collaborator.dto.ContactRequest;
import es.bancosol.api.collaborator.dto.ContactResponse;
import es.bancosol.api.collaborator.entity.Collaborator;
import es.bancosol.api.collaborator.entity.Contact;
import es.bancosol.api.collaborator.repository.CollaboratorRepository;
import es.bancosol.api.collaborator.repository.ContactRepository;
import es.bancosol.api.territory.entity.Locality;
import es.bancosol.api.territory.repository.LocalityRepository;
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
public class CollaboratorService {
    private final CollaboratorRepository collaboratorRepository;
    private final ContactRepository contactRepository;
    private final LocalityRepository localityRepository;

    public Page<CollaboratorResponse> list(String name, Integer localityId, Pageable pageable) {
        return collaboratorRepository.search(normalizeFilter(name), localityId, pageable)
                .map(CollaboratorResponse::from);
    }

    public CollaboratorResponse get(Integer collaboratorId) {
        return CollaboratorResponse.from(findActiveCollaborator(collaboratorId));
    }

    @Transactional
    public CollaboratorResponse create(CollaboratorRequest request) {
        Locality locality = findActiveLocalityForUpdate(request.localityId());
        Collaborator collaborator = new Collaborator(request.name(), request.address(), locality);
        return CollaboratorResponse.from(collaboratorRepository.save(collaborator));
    }

    @Transactional
    public CollaboratorResponse update(Integer collaboratorId, CollaboratorRequest request) {
        Collaborator collaborator = findActiveCollaboratorForUpdate(collaboratorId);
        Locality locality = findActiveLocalityForUpdate(request.localityId());
        collaborator.setName(request.name());
        collaborator.setAddress(request.address());
        collaborator.setLocality(locality);
        return CollaboratorResponse.from(collaborator);
    }

    @Transactional
    public void delete(Integer collaboratorId) {
        Collaborator collaborator = findActiveCollaboratorForUpdate(collaboratorId);
        Instant deletedAt = Instant.now();
        collaborator.setDeletedAt(deletedAt);
        contactRepository.findActiveByCollaboratorId(collaborator.getId())
                .forEach(contact -> contact.setDeletedAt(deletedAt));
    }

    public Page<ContactResponse> listContacts(Integer collaboratorId, Pageable pageable) {
        findActiveCollaborator(collaboratorId);
        return contactRepository.findByCollaboratorId(collaboratorId, pageable)
                .map(ContactResponse::from);
    }

    public ContactResponse getContact(Integer collaboratorId, Integer contactId) {
        findActiveCollaborator(collaboratorId);
        Contact contact = contactRepository.findByIdAndCollaboratorId(contactId, collaboratorId)
                .orElseThrow(this::notFound);
        return ContactResponse.from(contact);
    }

    @Transactional
    public ContactResponse createContact(Integer collaboratorId, ContactRequest request) {
        Collaborator collaborator = findActiveCollaboratorForUpdate(collaboratorId);
        Contact contact = new Contact(request.name(), normalizeOptional(request.email()), request.phoneNumber(), collaborator);
        return ContactResponse.from(contactRepository.save(contact));
    }

    @Transactional
    public ContactResponse updateContact(Integer collaboratorId, Integer contactId, ContactRequest request) {
        findActiveCollaboratorForUpdate(collaboratorId);
        Contact contact = contactRepository.findForUpdate(contactId, collaboratorId)
                .orElseThrow(this::notFound);
        contact.setName(request.name());
        contact.setEmail(normalizeOptional(request.email()));
        contact.setPhoneNumber(request.phoneNumber());
        return ContactResponse.from(contact);
    }

    @Transactional
    public void deleteContact(Integer collaboratorId, Integer contactId) {
        findActiveCollaboratorForUpdate(collaboratorId);
        Contact contact = contactRepository.findForUpdate(contactId, collaboratorId)
                .orElseThrow(this::notFound);
        contact.setDeletedAt(Instant.now());
    }

    private Collaborator findActiveCollaborator(Integer collaboratorId) {
        return collaboratorRepository.findById(collaboratorId).orElseThrow(this::notFound);
    }

    private Collaborator findActiveCollaboratorForUpdate(Integer collaboratorId) {
        return collaboratorRepository.findForUpdate(collaboratorId).orElseThrow(this::notFound);
    }

    private Locality findActiveLocalityForUpdate(Integer localityId) {
        return localityRepository.findForUpdate(localityId).orElseThrow(this::notFound);
    }

    private String normalizeFilter(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
}
