package es.bancosol.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class ApiApplicationTests {

	@Value("${roles-and-permission-sync}")
	private String rolesAndPermissionSync;

	@Test
	void contextLoads() {
		assertEquals("IF_EMPTY", rolesAndPermissionSync);
	}

}
