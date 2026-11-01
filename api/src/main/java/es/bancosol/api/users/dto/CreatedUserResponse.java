package es.bancosol.api.users.dto;

import java.util.List;
import es.bancosol.api.users.entity.User;

public record CreatedUserResponse(Integer id, String email, List<String> roles, String temporaryPassword) {
    public static CreatedUserResponse from(User user, List<String> roles, String temporaryPassword) {
        return new CreatedUserResponse(user.getId(), user.getEmail(), roles, temporaryPassword);
    }
}
