package es.bancosol.api.collaborator.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
public record ContactRequest(@NotBlank String name,@Email String email,String phoneNumber) {}
