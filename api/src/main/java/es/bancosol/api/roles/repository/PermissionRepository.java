package es.bancosol.api.roles.repository;

import java.util.List;
import java.util.Optional;
import es.bancosol.api.roles.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    Optional<Permission> findByName(String name);
    List<Permission> findByDeletedAtIsNull();
}
