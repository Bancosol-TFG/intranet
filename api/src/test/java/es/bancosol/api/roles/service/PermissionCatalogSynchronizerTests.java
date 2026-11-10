package es.bancosol.api.roles.service;

import es.bancosol.api.auth.service.PermissionChangeTracker;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import es.bancosol.api.roles.repository.RolePermissionCatalogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PermissionCatalogSynchronizerTests {
    @Mock
    private RolePermissionCatalogRepository catalogRepository;

    @Mock
    private RolePermissionCatalogDatabaseChecker databaseChecker;

    @Mock
    private RolePermissionCatalogChecker catalogChecker;

    @Mock
    private PermissionChangeTracker permissionChangeTracker;

    private PermissionCatalogSynchronizer synchronizer;

    @BeforeEach
    void setUp() {
        synchronizer = new PermissionCatalogSynchronizer(catalogRepository, databaseChecker, catalogChecker,
                permissionChangeTracker);
    }

    @Test
    void offChecksEndpointsAgainstDatabaseWithoutLockOrCatalogLoading() {
        setSyncMode("OFF");

        synchronizer.run(null);

        verify(catalogChecker).checkEndpointsAgainstDatabase();
        verifyNoMoreInteractions(catalogRepository, databaseChecker, catalogChecker, permissionChangeTracker);
    }

    @Test
    void ifEmptyWhenInitializedChecksPermissionsAndCatalogWithoutWriting() {
        RolePermissionCatalog catalog = new RolePermissionCatalogLoader().load();
        setSyncMode("IF_EMPTY");
        when(catalogRepository.isInitialized()).thenReturn(true);

        synchronizer.run(null);

        verify(catalogRepository).acquireAdvisoryLock();
        verify(catalogRepository).isInitialized();
        verify(databaseChecker).checkPermissions(catalog);
        verify(catalogChecker).checkCatalog(catalog);
        verifyNoMoreInteractions(catalogRepository, databaseChecker, catalogChecker, permissionChangeTracker);
    }

    @Test
    void ifEmptyWhenUninitializedInitializesChecksAndMarksInitialized() {
        RolePermissionCatalog catalog = new RolePermissionCatalogLoader().load();
        setSyncMode("IF_EMPTY");
        when(catalogRepository.isInitialized()).thenReturn(false);
        when(catalogRepository.initializeCatalog(catalog)).thenReturn(true);
        TransactionSynchronizationManager.initSynchronization();
        try {
            synchronizer.run(null);

            verify(catalogRepository).acquireAdvisoryLock();
            verify(catalogRepository).isInitialized();
            verify(catalogRepository).initializeCatalog(catalog);
            verify(databaseChecker).checkPermissions(catalog);
            verify(databaseChecker).checkRoles(catalog);
            verify(catalogChecker).checkCatalog(catalog);
            verify(catalogRepository).markInitialized();
            assertThat(TransactionSynchronizationManager.getSynchronizations()).hasSize(1);
            verifyNoInteractions(permissionChangeTracker);

            TransactionSynchronization synchronization = TransactionSynchronizationManager.getSynchronizations()
                    .getFirst();
            synchronization.afterCommit();

            verify(permissionChangeTracker).markChanged();
            verifyNoMoreInteractions(catalogRepository, databaseChecker, catalogChecker, permissionChangeTracker);
        } finally {
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.clearSynchronization();
            }
        }
    }

    @Test
    void forceReconcilesChecksRolesAndPermissionsAndMarksInitialized() {
        RolePermissionCatalog catalog = new RolePermissionCatalogLoader().load();
        setSyncMode("FORCE");
        when(catalogRepository.reconcileCatalog(catalog)).thenReturn(true);
        TransactionSynchronizationManager.initSynchronization();
        try {
            synchronizer.run(null);

            verify(catalogRepository).acquireAdvisoryLock();
            verify(catalogRepository).reconcileCatalog(catalog);
            verify(databaseChecker).checkPermissions(catalog);
            verify(databaseChecker).checkRoles(catalog);
            verify(catalogChecker).checkCatalog(catalog);
            verify(catalogRepository).markInitialized();
            assertThat(TransactionSynchronizationManager.getSynchronizations()).hasSize(1);
            verifyNoInteractions(permissionChangeTracker);

            TransactionSynchronization synchronization = TransactionSynchronizationManager.getSynchronizations()
                    .getFirst();
            synchronization.afterCommit();

            verify(permissionChangeTracker).markChanged();
            verifyNoMoreInteractions(catalogRepository, databaseChecker, catalogChecker, permissionChangeTracker);
        } finally {
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.clearSynchronization();
            }
        }
    }

    @Test
    void checkValidatesPermissionsRolesAndCatalogWithoutWriting() {
        RolePermissionCatalog catalog = new RolePermissionCatalogLoader().load();
        setSyncMode("CHECK");

        synchronizer.run(null);

        verify(catalogRepository).acquireAdvisoryLock();
        verify(databaseChecker).checkPermissions(catalog);
        verify(databaseChecker).checkRoles(catalog);
        verify(catalogChecker).checkCatalog(catalog);
        verifyNoMoreInteractions(catalogRepository, databaseChecker, catalogChecker, permissionChangeTracker);
    }

    @Test
    void invalidModeFailsBeforeInteractingWithDependencies() {
        setSyncMode("INVALID");

        assertThatThrownBy(() -> synchronizer.run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("roles-and-permission-sync");

        verifyNoInteractions(catalogRepository, databaseChecker, catalogChecker, permissionChangeTracker);
    }

    @Test
    void initializationWithoutChangesDoesNotRegisterTokenInvalidation() {
        RolePermissionCatalog catalog = new RolePermissionCatalogLoader().load();
        setSyncMode("IF_EMPTY");
        when(catalogRepository.isInitialized()).thenReturn(false);
        when(catalogRepository.initializeCatalog(catalog)).thenReturn(false);

        synchronizer.run(null);

        verify(catalogRepository).acquireAdvisoryLock();
        verify(catalogRepository).isInitialized();
        verify(catalogRepository).initializeCatalog(catalog);
        verify(databaseChecker).checkPermissions(catalog);
        verify(databaseChecker).checkRoles(catalog);
        verify(catalogChecker).checkCatalog(catalog);
        verify(catalogRepository).markInitialized();
        assertThat(TransactionSynchronizationManager.isSynchronizationActive()).isFalse();
        verifyNoMoreInteractions(catalogRepository, databaseChecker, catalogChecker, permissionChangeTracker);
    }

    @Test
    void reconciliationWithoutChangesDoesNotRegisterTokenInvalidation() {
        RolePermissionCatalog catalog = new RolePermissionCatalogLoader().load();
        setSyncMode("FORCE");
        when(catalogRepository.reconcileCatalog(catalog)).thenReturn(false);

        synchronizer.run(null);

        verify(catalogRepository).acquireAdvisoryLock();
        verify(catalogRepository).reconcileCatalog(catalog);
        verify(databaseChecker).checkPermissions(catalog);
        verify(databaseChecker).checkRoles(catalog);
        verify(catalogChecker).checkCatalog(catalog);
        verify(catalogRepository).markInitialized();
        assertThat(TransactionSynchronizationManager.isSynchronizationActive()).isFalse();
        verifyNoMoreInteractions(catalogRepository, databaseChecker, catalogChecker, permissionChangeTracker);
    }

    @Test
    void failedInitialValidationRollsBackCatalogInitialization() {
        RolePermissionCatalog catalog = new RolePermissionCatalogLoader().load();
        CatalogValidationException validationException = new CatalogValidationException("invalid catalog state");
        PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
        TransactionStatus transactionStatus = mock(TransactionStatus.class);
        when(transactionManager.getTransaction(any())).thenReturn(transactionStatus);
        setSyncMode("IF_EMPTY");
        when(catalogRepository.isInitialized()).thenReturn(false);
        when(catalogRepository.initializeCatalog(catalog)).thenReturn(true);
        doThrow(validationException).when(databaseChecker).checkRoles(catalog);

        ProxyFactory proxyFactory = new ProxyFactory(synchronizer);
        proxyFactory.addAdvice(new TransactionInterceptor(transactionManager,
                new AnnotationTransactionAttributeSource()));
        ApplicationRunner transactionalSynchronizer = (ApplicationRunner) proxyFactory.getProxy();

        assertThatThrownBy(() -> transactionalSynchronizer.run(null)).isSameAs(validationException);

        verify(transactionManager).rollback(transactionStatus);
        verify(transactionManager, never()).commit(transactionStatus);
        verify(catalogRepository, never()).markInitialized();
        verifyNoInteractions(permissionChangeTracker);
    }

    private void setSyncMode(String syncMode) {
        ReflectionTestUtils.setField(synchronizer, "syncMode", syncMode);
    }
}
