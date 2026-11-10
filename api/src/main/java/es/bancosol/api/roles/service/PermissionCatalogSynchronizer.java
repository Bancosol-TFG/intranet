package es.bancosol.api.roles.service;

import es.bancosol.api.auth.service.PermissionChangeTracker;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import es.bancosol.api.roles.repository.RolePermissionCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PermissionCatalogSynchronizer implements ApplicationRunner {
    private static final String PROPERTY_NAME = "roles-and-permission-sync";
    private static final String IF_EMPTY = "IF_EMPTY";
    private static final String FORCE = "FORCE";
    private static final String CHECK = "CHECK";
    private static final String OFF = "OFF";

    private final RolePermissionCatalogRepository catalogRepository;
    private final RolePermissionCatalogDatabaseChecker databaseChecker;
    private final RolePermissionCatalogChecker catalogChecker;
    private final PermissionChangeTracker permissionChangeTracker;
    private final RolePermissionCatalogLoader catalogLoader = new RolePermissionCatalogLoader();

    @Value("${roles-and-permission-sync}")
    private String syncMode;

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        validateMode();
        if (OFF.equals(syncMode)) {
            catalogChecker.checkEndpointsAgainstDatabase();
            return;
        }

        catalogRepository.acquireAdvisoryLock();
        RolePermissionCatalog catalog = catalogLoader.load();
        boolean catalogChanged = switch (syncMode) {
            case IF_EMPTY -> synchronizeIfEmpty(catalog);
            case FORCE -> synchronizeForce(catalog);
            case CHECK -> checkCatalog(catalog);
            default -> throw invalidMode();
        };

        if (catalogChanged) {
            invalidateTokensAfterCommit();
        }
    }

    private boolean synchronizeIfEmpty(RolePermissionCatalog catalog) {
        if (catalogRepository.isInitialized()) {
            databaseChecker.checkPermissions(catalog);
            catalogChecker.checkCatalog(catalog);
            return false;
        }

        boolean changed = catalogRepository.initializeCatalog(catalog);
        databaseChecker.checkPermissions(catalog);
        databaseChecker.checkRoles(catalog);
        catalogChecker.checkCatalog(catalog);
        catalogRepository.markInitialized();
        return changed;
    }

    private boolean synchronizeForce(RolePermissionCatalog catalog) {
        boolean changed = catalogRepository.reconcileCatalog(catalog);
        databaseChecker.checkPermissions(catalog);
        databaseChecker.checkRoles(catalog);
        catalogChecker.checkCatalog(catalog);
        catalogRepository.markInitialized();
        return changed;
    }

    private boolean checkCatalog(RolePermissionCatalog catalog) {
        databaseChecker.checkPermissions(catalog);
        databaseChecker.checkRoles(catalog);
        catalogChecker.checkCatalog(catalog);
        return false;
    }

    private void invalidateTokensAfterCommit() {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                permissionChangeTracker.markChanged();
            }
        });
    }

    private void validateMode() {
        if (!IF_EMPTY.equals(syncMode) && !FORCE.equals(syncMode)
                && !CHECK.equals(syncMode) && !OFF.equals(syncMode)) {
            throw invalidMode();
        }
    }

    private IllegalStateException invalidMode() {
        return new IllegalStateException("Valor no válido para la propiedad '" + PROPERTY_NAME + "': '"
                + syncMode + "'. Valores válidos: IF_EMPTY, FORCE, CHECK, OFF.");
    }
}
