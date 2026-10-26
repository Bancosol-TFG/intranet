package es.bancosol.api.collaborator;

import java.util.UUID;
import es.bancosol.api.territory.entity.Locality;
import es.bancosol.api.territory.repository.LocalityRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CollaboratorIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LocalityRepository localityRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void createsListsFiltersAndUpdatesCollaborator() throws Exception {
        Locality locality = createLocality();
        Locality destinationLocality = createLocality();
        String originalName = uniqueValue();
        String response = mockMvc.perform(post("/collaborators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(collaboratorBody(originalName, locality.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(originalName))
                .andExpect(jsonPath("$.localityId").value(locality.getId()))
                .andReturn().getResponse().getContentAsString();
        Integer collaboratorId = com.jayway.jsonpath.JsonPath.read(response, "$.id");

        mockMvc.perform(get("/collaborators"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/collaborators")
                        .param("name", originalName.substring(1, 8))
                        .param("localityId", String.valueOf(locality.getId()))
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1));

        String updatedName = uniqueValue();
        mockMvc.perform(put("/collaborators/{collaboratorId}", collaboratorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(collaboratorBody(updatedName, destinationLocality.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(updatedName))
                .andExpect(jsonPath("$.localityName").value(destinationLocality.getName()));

        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT name FROM collaborators WHERE id = ?", String.class, collaboratorId))
                .isEqualTo(updatedName);
    }

    @Test
    void validatesAndRejectsMissingOrDeletedLocalities() throws Exception {
        Locality deletedLocality = createLocality();
        mockMvc.perform(delete("/localities/{localityId}", deletedLocality.getId()))
                .andExpect(status().isNoContent());
        entityManager.flush();

        mockMvc.perform(post("/collaborators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/collaborators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(collaboratorBody(uniqueValue(), 987654321)))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/collaborators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(collaboratorBody(uniqueValue(), deletedLocality.getId())))
                .andExpect(status().isNotFound());
    }

    @Test
    void managesContactsWithPaginationAndEnforcesParentOwnership() throws Exception {
        Integer firstCollaboratorId = createCollaborator(createLocality());
        Integer secondCollaboratorId = createCollaborator(createLocality());
        String createdContact = mockMvc.perform(post("/collaborators/{collaboratorId}/contacts", firstCollaboratorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contactBody("Contacto A", "a@example.org", "+34 600")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("a@example.org"))
                .andReturn().getResponse().getContentAsString();
        Integer contactId = com.jayway.jsonpath.JsonPath.read(createdContact, "$.id");
        mockMvc.perform(post("/collaborators/{collaboratorId}/contacts", firstCollaboratorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contactBody("Contacto B", "", null)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/collaborators/{collaboratorId}/contacts", firstCollaboratorId)
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.page.totalElements").value(2));
        mockMvc.perform(get("/collaborators/{collaboratorId}/contacts/{contactId}", firstCollaboratorId, contactId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(contactId));
        mockMvc.perform(get("/collaborators/{collaboratorId}/contacts/{contactId}", secondCollaboratorId, contactId))
                .andExpect(status().isNotFound());
        mockMvc.perform(put("/collaborators/{collaboratorId}/contacts/{contactId}", secondCollaboratorId, contactId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contactBody("Contacto ajeno", null, null)))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/collaborators/{collaboratorId}/contacts/{contactId}", secondCollaboratorId, contactId))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/collaborators/{collaboratorId}/contacts", firstCollaboratorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contactBody("Email inválido", "no-es-un-correo", null)))
                .andExpect(status().isBadRequest());
        mockMvc.perform(put("/collaborators/{collaboratorId}/contacts/{contactId}", firstCollaboratorId, contactId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contactBody("Actualizado", "nuevo@example.org", "texto libre")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Actualizado"))
                .andExpect(jsonPath("$.phoneNumber").value("texto libre"));
        mockMvc.perform(delete("/collaborators/{collaboratorId}/contacts/{contactId}", firstCollaboratorId, contactId))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/collaborators/{collaboratorId}/contacts/{contactId}", firstCollaboratorId, contactId))
                .andExpect(status().isNotFound());
    }

    @Test
    void collaboratorRemovalHidesResourceAndSoftDeletesContacts() throws Exception {
        Integer collaboratorId = createCollaborator(createLocality());
        String response = mockMvc.perform(post("/collaborators/{collaboratorId}/contacts", collaboratorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contactBody("Persona", null, null)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Integer contactId = com.jayway.jsonpath.JsonPath.read(response, "$.id");

        mockMvc.perform(delete("/collaborators/{collaboratorId}", collaboratorId))
                .andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();

        assertThat(jdbcTemplate.queryForObject(
                "SELECT deleted_at FROM collaborators WHERE id = ?", java.sql.Timestamp.class, collaboratorId))
                .isNotNull();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT deleted_at FROM contacts WHERE id = ?", java.sql.Timestamp.class, contactId))
                .isNotNull();
        mockMvc.perform(get("/collaborators/{collaboratorId}", collaboratorId)).andExpect(status().isNotFound());
        mockMvc.perform(get("/collaborators/{collaboratorId}/contacts", collaboratorId)).andExpect(status().isNotFound());
        mockMvc.perform(post("/collaborators/{collaboratorId}/contacts", collaboratorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contactBody("Rechazado", null, null)))
                .andExpect(status().isNotFound());
    }

    @Test
    void localityCannotBeRemovedUntilCollaboratorMovesOrIsDeleted() throws Exception {
        Locality originalLocality = createLocality();
        Integer collaboratorId = createCollaborator(originalLocality);

        mockMvc.perform(delete("/localities/{localityId}", originalLocality.getId()))
                .andExpect(status().isConflict());
        Locality destinationLocality = createLocality();
        mockMvc.perform(put("/collaborators/{collaboratorId}", collaboratorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(collaboratorBody(uniqueValue(), destinationLocality.getId())))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/localities/{localityId}", originalLocality.getId()))
                .andExpect(status().isNoContent());

        Locality usedLocality = createLocality();
        Integer secondCollaboratorId = createCollaborator(usedLocality);
        mockMvc.perform(delete("/collaborators/{collaboratorId}", secondCollaboratorId))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete("/localities/{localityId}", usedLocality.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void rejectsMissingCollaboratorsAndContacts() throws Exception {
        mockMvc.perform(get("/collaborators/{collaboratorId}", 99999999)).andExpect(status().isNotFound());
        mockMvc.perform(put("/collaborators/{collaboratorId}", 99999999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(collaboratorBody(uniqueValue(), createLocality().getId())))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/collaborators/{collaboratorId}/contacts", 99999999))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/collaborators/{collaboratorId}/contacts/{contactId}", 99999999, 88888888))
                .andExpect(status().isNotFound());
    }

    private Locality createLocality() {
        return localityRepository.save(new Locality(uniqueValue(), uniqueValue()));
    }

    private Integer createCollaborator(Locality locality) throws Exception {
        String response = mockMvc.perform(post("/collaborators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(collaboratorBody(uniqueValue(), locality.getId())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return com.jayway.jsonpath.JsonPath.read(response, "$.id");
    }

    private String uniqueValue() {
        return UUID.randomUUID().toString();
    }

    private String collaboratorBody(String name, Integer localityId) {
        return "{\"name\":\"" + name + "\",\"address\":\"Calle de prueba\",\"localityId\":" + localityId + "}";
    }

    private String contactBody(String name, String email, String phoneNumber) {
        return "{\"name\":\"" + name + "\",\"email\":" + jsonValue(email)
                + ",\"phoneNumber\":" + jsonValue(phoneNumber) + "}";
    }

    private String jsonValue(String value) {
        return value == null ? "null" : "\"" + value + "\"";
    }
}
