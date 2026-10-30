package es.bancosol.api.collaborator.dto;

import es.bancosol.api.collaborator.entity.Contact;

public record ContactResponse(Integer id, String name, String email, String phoneNumber) {
    public static ContactResponse from(Contact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getName(),
                contact.getEmail(),
                contact.getPhoneNumber());
    }
}
