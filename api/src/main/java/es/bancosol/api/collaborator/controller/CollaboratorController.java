package es.bancosol.api.collaborator.controller;

import es.bancosol.api.collaborator.dto.CollaboratorRequest;
import es.bancosol.api.collaborator.dto.CollaboratorResponse;
import es.bancosol.api.collaborator.dto.ContactRequest;
import es.bancosol.api.collaborator.dto.ContactResponse;
import es.bancosol.api.collaborator.service.CollaboratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/collaborators")
@RequiredArgsConstructor
public class CollaboratorController {
    private final CollaboratorService service;

    @GetMapping
    public PagedModel<CollaboratorResponse> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer localityId,
            Pageable pageable) {
        return new PagedModel<>(service.list(name, localityId, pageable));
    }

    @GetMapping("/{collaboratorId}")
    public CollaboratorResponse get(@PathVariable Integer collaboratorId) {
        return service.get(collaboratorId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CollaboratorResponse create(@Valid @RequestBody CollaboratorRequest request) {
        return service.create(request);
    }

    @PutMapping("/{collaboratorId}")
    public CollaboratorResponse update(
            @PathVariable Integer collaboratorId,
            @Valid @RequestBody CollaboratorRequest request) {
        return service.update(collaboratorId, request);
    }

    @DeleteMapping("/{collaboratorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer collaboratorId) {
        service.delete(collaboratorId);
    }

    @GetMapping("/{collaboratorId}/contacts")
    public PagedModel<ContactResponse> listContacts(@PathVariable Integer collaboratorId, Pageable pageable) {
        return new PagedModel<>(service.listContacts(collaboratorId, pageable));
    }

    @GetMapping("/{collaboratorId}/contacts/{contactId}")
    public ContactResponse getContact(
            @PathVariable Integer collaboratorId,
            @PathVariable Integer contactId) {
        return service.getContact(collaboratorId, contactId);
    }

    @PostMapping("/{collaboratorId}/contacts")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactResponse createContact(
            @PathVariable Integer collaboratorId,
            @Valid @RequestBody ContactRequest request) {
        return service.createContact(collaboratorId, request);
    }

    @PutMapping("/{collaboratorId}/contacts/{contactId}")
    public ContactResponse updateContact(
            @PathVariable Integer collaboratorId,
            @PathVariable Integer contactId,
            @Valid @RequestBody ContactRequest request) {
        return service.updateContact(collaboratorId, contactId, request);
    }

    @DeleteMapping("/{collaboratorId}/contacts/{contactId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContact(
            @PathVariable Integer collaboratorId,
            @PathVariable Integer contactId) {
        service.deleteContact(collaboratorId, contactId);
    }
}
