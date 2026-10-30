package es.bancosol.api.roles.repository;

import java.util.List;
import java.util.Optional;
import es.bancosol.api.roles.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Integer> {
    List<RolePermission> findByRole_IdAndDeletedAtIsNull(Integer roleId);
    Optional<RolePermission> findByRole_IdAndPermission_IdAndDeletedAtIsNull(Integer roleId, Integer permissionId);
    Optional<RolePermission> findByRole_IdAndPermission_IdAndDeletedAtIsNotNull(Integer roleId, Integer permissionId);
}
