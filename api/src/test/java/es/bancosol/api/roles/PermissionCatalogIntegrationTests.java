package es.bancosol.api.roles;

import java.time.Instant;
import java.util.Arrays;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.roles.entity.Permission;
import es.bancosol.api.roles.repository.PermissionRepository;
import es.bancosol.api.roles.service.PermissionCatalogSynchronizer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ExtendWith(OutputCaptureExtension.class)
class PermissionCatalogIntegrationTests {
    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private PermissionCatalogSynchronizer permissionCatalogSynchronizer;

    @Test
    void createsEveryPermissionFromTheApplicationCatalog() {
        Arrays.stream(PermissionCode.values()).forEach(permissionCode -> {
            Permission permission = permissionRepository.findByName(permissionCode.name()).orElseThrow();

            assertThat(permission.getDescription()).isEqualTo(permissionCode.getDescription());
            assertThat(permission.getDeletedAt()).isNull();
        });
    }

    @Test
    void reactivatesCatalogPermissionsAndRefreshesTheirDescriptions() {
        PermissionCode permissionCode = PermissionCode.ROLE_CREATE;
        Permission permission = permissionRepository.findByName(permissionCode.name()).orElseThrow();
        permission.setDeletedAt(Instant.now());
        permission.setDescription("Descripción antigua");
        permissionRepository.saveAndFlush(permission);

        permissionCatalogSynchronizer.run(emptyArguments());

        Permission synchronizedPermission = permissionRepository.findByName(permissionCode.name()).orElseThrow();
        assertThat(synchronizedPermission.getDeletedAt()).isNull();
        assertThat(synchronizedPermission.getDescription()).isEqualTo(permissionCode.getDescription());
    }

    @Test
    void preservesAndWarnsAboutPermissionsNotDeclaredInTheCatalog(CapturedOutput output) {
        String extraPermissionName = "PERMISSION_NOT_IN_CATALOG";
        permissionRepository.saveAndFlush(new Permission(extraPermissionName, "Permiso desconocido"));

        permissionCatalogSynchronizer.run(emptyArguments());

        assertThat(permissionRepository.findByName(extraPermissionName)).isPresent();
        assertThat(output).contains("Database permission '" + extraPermissionName
                + "' is not declared in PermissionCode.");
    }

    private ApplicationArguments emptyArguments() {
        return new DefaultApplicationArguments(new String[0]);
    }
}
