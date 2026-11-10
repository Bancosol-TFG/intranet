package es.bancosol.api.roles.service;

import java.nio.charset.StandardCharsets;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RolePermissionCatalogLoaderTests {
    private final RolePermissionCatalogLoader loader = new RolePermissionCatalogLoader();

    @Test
    void loadsCurrentCatalogFromClasspath() {
        RolePermissionCatalog catalog = loader.load();

        assertThat(catalog.permissions()).hasSize(56);
        assertThat(catalog.roles()).extracting("name")
                .containsExactly("ADMIN", "COLLABORATOR-MANAGER", "COORDINATOR", "STORE-MANAGER", "VOLUNTEER");
        assertThat(catalog.permissions()).extracting("name").contains("USER_CREATE", "ROLE_PERMISSION_ASSIGN");
    }

    @Test
    void loadsCatalogsDeterministicallyAndPreservesSources() {
        Resource[] permissions = resources(
                "permissions/zones.yaml", "permissions:\n  - name: ZONE_READ\n    description: Leer zona\n",
                "permissions/roles.yaml", "permissions:\n  - name: ROLE_PERMISSION_ASSIGN\n    description: Asignar permiso\n"
                        + "  - name: USER_CREATE\n    description: Crear usuario\n");
        Resource[] roles = resources(
                "roles/store-manager.yaml", "name: STORE-MANAGER\npermissions: []\n",
                "roles/admin.yaml", "name: ADMIN\npermissions:\n  - ROLE_PERMISSION_ASSIGN\n  - USER_CREATE\n");

        RolePermissionCatalog catalog = loader.load(permissions, roles);

        assertThat(catalog.permissions()).extracting("name")
                .containsExactly("ROLE_PERMISSION_ASSIGN", "USER_CREATE", "ZONE_READ");
        assertThat(catalog.roles()).extracting("name").containsExactly("ADMIN", "STORE-MANAGER");
        assertThat(catalog.roles().get(1).permissions()).isEmpty();
        assertThat(catalog.roles().get(0).permissions().getFirst().source().describe())
                .contains("roles/admin.yaml:3 [permissions[0]]");
        assertThat(catalog.permissions().getFirst().nameSource().describe())
                .contains("permissions/roles.yaml:2 [permissions[0].name]");
    }

    @Test
    void rejectsInvalidYamlAndReportsFile() {
        assertThatThrownBy(() -> load(
                "permissions/broken.yaml", "permissions:\n  - name: ZONE_READ\n    description: [bad\n",
                "roles/admin.yaml", "name: ADMIN\npermissions: []\n"))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("YAML inválido")
                .hasMessageContaining("permissions/broken.yaml:4 [$]");
    }

    @Test
    void rejectsDuplicateYamlKeysWithLineAndKey() {
        assertThatThrownBy(() -> load(
                "permissions/duplicate-key.yaml",
                "permissions:\n  - name: ZONE_READ\n    name: ZONE_LIST\n    description: Leer zona\n",
                "roles/admin.yaml", "name: ADMIN\npermissions: []\n"))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("clave YAML duplicada 'name'")
                .hasMessageContaining("duplicate-key.yaml:3")
                .hasMessageContaining("permissions[0].name");
    }

    @Test
    void rejectsInvalidPermissionFormatAndEmptyRequiredValues() {
        assertThatThrownBy(() -> load(
                "permissions/invalid-name.yaml", "permissions:\n  - name: Zone_READ\n    description: Leer zona\n",
                "roles/admin.yaml", "name: ADMIN\npermissions: []\n"))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("formato RECURSO_OPERACIÓN")
                .hasMessageContaining("invalid-name.yaml:2 [permissions[0].name]");

        assertThatThrownBy(() -> load(
                "permissions/empty-description.yaml", "permissions:\n  - name: ZONE_READ\n    description: '  '\n",
                "roles/admin.yaml", "name: ADMIN\npermissions: []\n"))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("descripción del permiso no puede estar vacío")
                .hasMessageContaining("empty-description.yaml:3 [permissions[0].description]");
    }

    @Test
    void rejectsDuplicatePermissionsRolesAndRoleAssignments() {
        assertThatThrownBy(() -> loader.load(
                resources("permissions/a.yaml", "permissions:\n  - name: ZONE_READ\n    description: Leer\n",
                        "permissions/b.yaml", "permissions:\n  - name: ZONE_READ\n    description: Leer\n"),
                resources("roles/admin.yaml", "name: ADMIN\npermissions: []\n")))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("permiso 'ZONE_READ' está duplicado")
                .hasMessageContaining("permissions/b.yaml:2 [permissions[0].name]");

        assertThatThrownBy(() -> loader.load(
                resources("permissions/a.yaml", "permissions:\n  - name: ZONE_READ\n    description: Leer\n"),
                resources("roles/a.yaml", "name: ADMIN\npermissions: []\n",
                        "roles/b.yaml", "name: ADMIN\npermissions: []\n")))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("rol 'ADMIN' está duplicado")
                .hasMessageContaining("roles/b.yaml:1 [name]");

        assertThatThrownBy(() -> load(
                "permissions/a.yaml", "permissions:\n  - name: ZONE_READ\n    description: Leer\n",
                "roles/admin.yaml", "name: ADMIN\npermissions:\n  - ZONE_READ\n  - ZONE_READ\n"))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("está asignado más de una vez")
                .hasMessageContaining("roles/admin.yaml:4 [permissions[1]]");
    }

    @Test
    void rejectsUnknownReferencesMissingFieldsInvalidTypesAndEmptyCatalogs() {
        assertThatThrownBy(() -> load(
                "permissions/a.yaml", "permissions:\n  - name: ZONE_READ\n    description: Leer\n",
                "roles/admin.yaml", "name: ADMIN\npermissions:\n  - UNKNOWN_READ\n"))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("no existe en el catálogo global")
                .hasMessageContaining("roles/admin.yaml:3 [permissions[0]]");

        assertThatThrownBy(() -> load(
                "permissions/missing-field.yaml", "permissions:\n  - name: ZONE_READ\n",
                "roles/admin.yaml", "name: ADMIN\npermissions: []\n"))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("falta el campo obligatorio 'description'")
                .hasMessageContaining("missing-field.yaml:2 [permissions[0].description]");

        assertThatThrownBy(() -> load(
                "permissions/a.yaml", "permissions:\n  - name: ZONE_READ\n    description: Leer\n",
                "roles/admin.yaml", "name: ADMIN\npermissions: invalid\n"))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("permissions debe ser una lista")
                .hasMessageContaining("roles/admin.yaml:2 [permissions]");

        assertThatThrownBy(() -> load(
                "permissions/a.yaml", "permissions:\n  - name: ZONE_READ\n    description: Leer\n",
                "roles/empty-name.yaml", "name: ''\npermissions: []\n"))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("nombre del rol no puede estar vacío")
                .hasMessageContaining("roles/empty-name.yaml:1 [name]");

        assertThatThrownBy(() -> loader.load(new Resource[0], resources("roles/admin.yaml", "name: ADMIN\npermissions: []\n")))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("catálogo global de permisos está vacío");

        assertThatThrownBy(() -> loader.load(resources("permissions/a.yaml",
                "permissions:\n  - name: ZONE_READ\n    description: Leer\n"), new Resource[0]))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("catálogo global de roles está vacío");
    }

    private RolePermissionCatalog load(String permissionFile, String permissionYaml, String roleFile, String roleYaml) {
        return loader.load(resources(permissionFile, permissionYaml), resources(roleFile, roleYaml));
    }

    private Resource[] resources(String... fileAndYaml) {
        return java.util.stream.IntStream.range(0, fileAndYaml.length / 2)
                .mapToObj(index -> new ByteArrayResource(fileAndYaml[index * 2 + 1].getBytes(StandardCharsets.UTF_8),
                        fileAndYaml[index * 2]))
                .toArray(Resource[]::new);
    }
}
