package es.bancosol.api.collaborator.dto;

import es.bancosol.api.collaborator.entity.Collaborator;

public record CollaboratorResponse(
        Integer id,
        String name,
        String address,
        Integer localityId,
        String localityName) {
    public static CollaboratorResponse from(Collaborator collaborator) {
        return new CollaboratorResponse(
                collaborator.getId(),
                collaborator.getName(),
                collaborator.getAddress(),
                collaborator.getLocality().getId(),
                collaborator.getLocality().getName());
    }
}
