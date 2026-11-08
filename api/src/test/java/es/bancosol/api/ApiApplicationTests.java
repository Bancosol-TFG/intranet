package es.bancosol.api;

import java.io.IOException;
import java.util.List;
import es.bancosol.api.roles.service.PermissionCatalogSynchronizer;
import es.bancosol.api.users.service.AdminBootstrapRunner;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ApiApplicationTests {

	@Value("${roles-and-permission-sync}")
	private String rolesAndPermissionSync;

	@Autowired
	private PermissionCatalogSynchronizer permissionCatalogSynchronizer;

    @Autowired
    private AdminBootstrapRunner adminBootstrapRunner;

    @Autowired
    private ObjectProvider<ApplicationRunner> applicationRunners;

	@Test
	void contextLoads() {
		assertEquals("IF_EMPTY", rolesAndPermissionSync);
	}

    @Test
    void catalogSynchronizerRunsBeforeAdminBootstrap() {
        List<ApplicationRunner> orderedRunners = applicationRunners.orderedStream().toList();
        assertTrue(orderedRunners.indexOf(permissionCatalogSynchronizer)
                < orderedRunners.indexOf(adminBootstrapRunner));
    }

	@Test
	void profilesExposeTheExpectedCatalogSyncConfiguration() throws IOException {
		YamlPropertySourceLoader loader = new YamlPropertySourceLoader();
		PropertySource<?> prod = loader.load("application-prod",
				new ClassPathResource("application-prod.yaml")).getFirst();
		PropertySource<?> dev = loader.load("application-dev",
				new ClassPathResource("application-dev.yaml")).getFirst();

		assertEquals("IF_EMPTY", prod.getProperty("roles-and-permission-sync"));
		assertEquals("${ROLES_AND_PERMISSION_SYNC}", dev.getProperty("roles-and-permission-sync"));
	}

}
