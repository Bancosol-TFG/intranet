package es.bancosol.api.collaborator.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public record CollaboratorRequest(@NotBlank String name,@NotBlank String address,@NotNull Integer localityId) {}
