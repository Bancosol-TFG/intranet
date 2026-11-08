package es.bancosol.api.roles.service;

import java.util.List;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.common.security.RequiresPermission;
import es.bancosol.api.roles.dto.CatalogPermission;
import es.bancosol.api.roles.dto.CatalogSource;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.repository.PermissionRepository;
import es.bancosol.api.roles.repository.RoleRepository;
import es.bancosol.api.roles.repository.RolePermissionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RolePermissionCatalogCheckerTests {
    @Test
    void discoversActualRegisteredRoutesAndMethods() throws Exception {
        RolePermissionCatalogChecker checker = checker(mapping(), List.of(), List.of());

        assertThat(checker.findPermissionEndpoints())
                .extracting(RolePermissionCatalogChecker.EndpointPermission::describe)
                .containsExactly("GET /records (CheckerController#read)",
                        "POST /records (CheckerController#create)");
    }

    @Test
    void reportsMissingDatabasePermissionWithEndpointDetails() throws Exception {
        RolePermissionCatalogChecker checker = checker(mapping(), List.of(), List.of());

        assertThatThrownBy(checker::checkEndpointsAgainstDatabase)
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("USER_CREATE")
                .hasMessageContaining("GET /records")
                .hasMessageContaining("CheckerController#read");
    }

    @Test
    void reportsEndpointWhenItsPermissionIsMissingFromCatalog() throws Exception {
        RolePermissionCatalog catalog = catalogWithout(PermissionCode.USER_CREATE.name());
        RolePermissionCatalogChecker checker = checker(mapping(), List.of(), List.of());

        assertThatThrownBy(() -> checker.checkCatalog(catalog))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("USER_CREATE")
                .hasMessageContaining("GET /records")
                .hasMessageContaining("CheckerController#read")
                .hasMessageContaining("no está declarado en YAML");
    }

    @Test
    void rejectsDifferencesBetweenPermissionEnumAndCatalog() throws Exception {
        RolePermissionCatalog catalog = catalogWithExtra("EXTRA_READ");
        RolePermissionCatalogChecker checker = checker(mapping(), List.of(), List.of());

        assertThatThrownBy(() -> checker.checkCatalog(catalog))
                .isInstanceOf(CatalogValidationException.class)
                .hasMessageContaining("PermissionCode y el catálogo YAML no coinciden")
                .hasMessageContaining("EXTRA_READ");
    }

    @Test
    @ExtendWith(OutputCaptureExtension.class)
    void warnsAboutUnusedCatalogPermissionAndDatabasePermissionWithoutRole(CapturedOutput output) throws Exception {
        Permission unusedPermission = new Permission("ZONE_LIST", "Consultar zonas");
        Permission endpointPermission = new Permission(PermissionCode.USER_CREATE.name(),
                PermissionCode.USER_CREATE.getDescription());
        RolePermissionCatalogChecker checker = checker(mapping(), List.of(unusedPermission, endpointPermission),
                List.of(PermissionCode.USER_CREATE.name()));

        checker.checkCatalog(new RolePermissionCatalogLoader().load());

        assertThat(output).contains("El permiso YAML 'ZONE_LIST' no está asociado a ningún endpoint.")
                .contains("El permiso activo en BD 'ZONE_LIST' no está asignado a ningún rol activo.")
                .contains("archivos=")
                .contains("permisos=56")
                .contains("roles=5")
                .contains("endpoints=2");
    }

    @Test
    @ExtendWith(OutputCaptureExtension.class)
    void endpointOnlyCheckWarnsAboutDatabasePermissionWithoutRoleAndLogsAvailableCounts(CapturedOutput output) {
        Permission endpointPermission = new Permission(PermissionCode.USER_CREATE.name(),
                PermissionCode.USER_CREATE.getDescription());
        Permission unusedPermission = new Permission("ZONE_LIST", "Consultar zonas");
        RolePermissionCatalogChecker checker = checker(mapping(), List.of(endpointPermission, unusedPermission),
                List.of(PermissionCode.USER_CREATE.name()));

        checker.checkEndpointsAgainstDatabase();

        assertThat(output).contains("El permiso activo en BD 'ZONE_LIST' no está asignado a ningún rol activo.")
                .contains("El permiso activo en BD 'ZONE_LIST' no está asociado a ningún endpoint.")
                .contains("archivos YAML=no cargados")
                .contains("permisos BD=2")
                .contains("roles BD=0")
                .contains("endpoints=2");
    }

    private RolePermissionCatalogChecker checker(RequestMappingHandlerMapping mapping,
            List<Permission> activePermissions, List<String> assignedPermissionNames) {
        PermissionRepository permissionRepository = mock(PermissionRepository.class);
        RoleRepository roleRepository = mock(RoleRepository.class);
        RolePermissionRepository rolePermissionRepository = mock(RolePermissionRepository.class);
        when(permissionRepository.findByDeletedAtIsNullOrderByNameAsc()).thenReturn(activePermissions);
        when(roleRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(rolePermissionRepository.findActivePermissionNamesAssignedToActiveRoles())
                .thenReturn(assignedPermissionNames);
        return new RolePermissionCatalogChecker(mapping, permissionRepository, roleRepository, rolePermissionRepository);
    }

    private RequestMappingHandlerMapping mapping() {
        GenericApplicationContext applicationContext = new GenericApplicationContext();
        applicationContext.registerBean(CheckerController.class);
        applicationContext.refresh();
        RequestMappingHandlerMapping mapping = new RequestMappingHandlerMapping();
        mapping.setApplicationContext(applicationContext);
        mapping.afterPropertiesSet();
        return mapping;
    }

    private RolePermissionCatalog catalogWithout(String permissionName) {
        RolePermissionCatalog catalog = new RolePermissionCatalogLoader().load();
        return new RolePermissionCatalog(catalog.permissions().stream()
                .filter(permission -> !permission.name().equals(permissionName))
                .toList(), catalog.roles());
    }

    private RolePermissionCatalog catalogWithExtra(String permissionName) {
        RolePermissionCatalog catalog = new RolePermissionCatalogLoader().load();
        CatalogSource source = new CatalogSource("permissions/extra.yaml", 1, "permissions[0].name");
        CatalogPermission extraPermission = new CatalogPermission(permissionName, "Permiso extra", source, source);
        return new RolePermissionCatalog(
                java.util.stream.Stream.concat(catalog.permissions().stream(), java.util.stream.Stream.of(extraPermission))
                        .toList(), catalog.roles());
    }

    @RestController
    static class CheckerController {
        @GetMapping("/records")
        @RequiresPermission(PermissionCode.USER_CREATE)
        public String read() {
            return "records";
        }

        @PostMapping("/records")
        @RequiresPermission(PermissionCode.USER_CREATE)
        public String create() {
            return "created";
        }
    }
}
