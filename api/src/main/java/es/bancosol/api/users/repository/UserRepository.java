package es.bancosol.api.users.repository;

import java.util.List;
import java.util.Optional;
import es.bancosol.api.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query(value = """
            SELECT roles.name FROM roles
            JOIN user_roles ON user_roles.role_id = roles.id AND user_roles.deleted_at IS NULL
            WHERE user_roles.user_id = :userId AND roles.deleted_at IS NULL
            ORDER BY roles.name
            """, nativeQuery = true)
    List<String> findRoleNames(@Param("userId") Integer userId);

    @Query(value = """
            SELECT DISTINCT permissions.name FROM permissions
            JOIN role_permissions ON role_permissions.permission_id = permissions.id
                AND role_permissions.deleted_at IS NULL
            JOIN roles ON roles.id = role_permissions.role_id AND roles.deleted_at IS NULL
            JOIN user_roles ON user_roles.role_id = roles.id AND user_roles.deleted_at IS NULL
            WHERE user_roles.user_id = :userId AND permissions.deleted_at IS NULL
            ORDER BY permissions.name
            """, nativeQuery = true)
    List<String> findPermissionNames(@Param("userId") Integer userId);

    @Query(value = "SELECT COUNT(*) FROM roles WHERE name IN (:roleNames) AND deleted_at IS NULL", nativeQuery = true)
    long countRoles(@Param("roleNames") List<String> roleNames);

    @Modifying
    @Query(value = """
            INSERT INTO user_roles (user_id, role_id)
            SELECT :userId, id FROM roles WHERE name IN (:roleNames) AND deleted_at IS NULL
            """, nativeQuery = true)
    void assignRoles(@Param("userId") Integer userId, @Param("roleNames") List<String> roleNames);
}
