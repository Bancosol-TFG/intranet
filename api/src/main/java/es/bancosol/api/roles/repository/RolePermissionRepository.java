package es.bancosol.api.roles.repository;

import java.util.List;
import java.util.Optional;
import es.bancosol.api.roles.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Integer> {
    @Query("select distinct rolePermission.permission.name from RolePermission rolePermission "
            + "where rolePermission.deletedAt is null and rolePermission.role.deletedAt is null "
            + "and rolePermission.permission.deletedAt is null")
    List<String> findActivePermissionNamesAssignedToActiveRoles();

    List<RolePermission> findByRole_IdAndDeletedAtIsNull(Integer roleId);
    List<RolePermission> findByRole_IdAndDeletedAtIsNotNull(Integer roleId);
    List<RolePermission> findByRole_IdAndDeletedAtIsNullAndPermission_DeletedAtIsNullOrderByPermission_NameAsc(
            Integer roleId);
    Optional<RolePermission> findByRole_IdAndPermission_IdAndDeletedAtIsNull(Integer roleId, Integer permissionId);
    Optional<RolePermission> findByRole_IdAndPermission_IdAndDeletedAtIsNotNull(Integer roleId, Integer permissionId);
}
