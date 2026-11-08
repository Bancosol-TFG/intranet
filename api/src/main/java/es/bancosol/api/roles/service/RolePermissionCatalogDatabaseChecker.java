package es.bancosol.api.roles.service;

import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import es.bancosol.api.roles.repository.RolePermissionCatalogRepository;
import org.springframework.stereotype.Service;

@Service
public class RolePermissionCatalogDatabaseChecker {
    private final RolePermissionCatalogRepository rolePermissionCatalogRepository;

    public RolePermissionCatalogDatabaseChecker(RolePermissionCatalogRepository rolePermissionCatalogRepository) {
        this.rolePermissionCatalogRepository = rolePermissionCatalogRepository;
    }

    public void checkPermissions(RolePermissionCatalog catalog) {
        Map<String, String> catalogPermissions = new TreeMap<>();
        catalog.permissions().forEach(permission ->
                catalogPermissions.put(permission.name(), permission.description()));
        Map<String, String> databasePermissions = new TreeMap<>();
        rolePermissionCatalogRepository.findActivePermissions().forEach(permission ->
                databasePermissions.put(permission.name(), permission.description()));
        Set<String> catalogPermissionNames = catalogPermissions.keySet();
        Set<String> databasePermissionNames = databasePermissions.keySet();
        Set<String> missingFromDatabase = difference(catalogPermissionNames, databasePermissionNames);
        Set<String> extraInDatabase = difference(databasePermissionNames, catalogPermissionNames);
        Set<String> descriptionDifferences = new TreeSet<>();
        for (String permissionName : catalogPermissionNames) {
            String databaseDescription = databasePermissions.get(permissionName);
            if (databasePermissions.containsKey(permissionName)
                    && !Objects.equals(catalogPermissions.get(permissionName), databaseDescription)) {
                descriptionDifferences.add(permissionName + " (YAML='" + catalogPermissions.get(permissionName)
                        + "', BD='" + databaseDescription + "')");
            }
        }

        if (!missingFromDatabase.isEmpty() || !extraInDatabase.isEmpty() || !descriptionDifferences.isEmpty()) {
            throw new CatalogValidationException("El catálogo YAML y la BD no coinciden en permisos: "
                    + "faltan en BD=" + missingFromDatabase + ", sobran en BD=" + extraInDatabase
                    + ", descripciones distintas en BD=" + descriptionDifferences + ".");
        }
    }

    public void checkRoles(RolePermissionCatalog catalog) {
        Set<String> catalogRoleNames = catalog.roles().stream()
                .map(role -> role.name())
                .collect(TreeSet::new, TreeSet::add, TreeSet::addAll);
        Set<String> databaseRoleNames = new TreeSet<>(rolePermissionCatalogRepository.findActiveRoleNames());
        Set<String> catalogAssignments = catalog.roles().stream()
                .flatMap(role -> role.permissions().stream()
                        .map(permission -> assignmentName(role.name(), permission.name())))
                .collect(TreeSet::new, TreeSet::add, TreeSet::addAll);
        Set<String> databaseAssignments = rolePermissionCatalogRepository.findActiveRolePermissionAssignments()
                .stream()
                .map(assignment -> assignmentName(assignment.roleName(), assignment.permissionName()))
                .collect(TreeSet::new, TreeSet::add, TreeSet::addAll);

        Set<String> missingRolesFromDatabase = difference(catalogRoleNames, databaseRoleNames);
        Set<String> extraRolesInDatabase = difference(databaseRoleNames, catalogRoleNames);
        Set<String> missingAssignmentsFromDatabase = difference(catalogAssignments, databaseAssignments);
        Set<String> extraAssignmentsInDatabase = difference(databaseAssignments, catalogAssignments);

        if (!missingRolesFromDatabase.isEmpty() || !extraRolesInDatabase.isEmpty()
                || !missingAssignmentsFromDatabase.isEmpty() || !extraAssignmentsInDatabase.isEmpty()) {
            throw new CatalogValidationException("El catálogo YAML y la BD no coinciden en roles y asignaciones: "
                    + "faltan roles en BD=" + missingRolesFromDatabase
                    + ", sobran roles en BD=" + extraRolesInDatabase
                    + ", faltan asignaciones en BD=" + missingAssignmentsFromDatabase
                    + ", sobran asignaciones en BD=" + extraAssignmentsInDatabase + ".");
        }
    }

    private Set<String> difference(Set<String> minuend, Set<String> subtrahend) {
        Set<String> difference = new TreeSet<>(minuend);
        difference.removeAll(subtrahend);
        return difference;
    }

    private static String assignmentName(String roleName, String permissionName) {
        return roleName + " -> " + permissionName;
    }
}
