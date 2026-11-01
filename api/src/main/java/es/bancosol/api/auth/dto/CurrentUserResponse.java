package es.bancosol.api.auth.dto;

import java.util.List;
import es.bancosol.api.users.entity.User;

public record CurrentUserResponse(Integer id, String email, String firstName, String surname, List<String> roles,
                                  List<String> permissions, boolean mustChangePassword) {
    public static CurrentUserResponse from(User user, List<String> roles, List<String> permissions) {
        return new CurrentUserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getSurname(), roles,
                permissions, user.isMustChangePassword());
    }
}
