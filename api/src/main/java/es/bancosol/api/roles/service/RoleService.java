package es.bancosol.api.roles.service;

import es.bancosol.api.roles.dto.RoleRequest;
import es.bancosol.api.roles.dto.RoleResponse;
import es.bancosol.api.roles.entity.Role;
import es.bancosol.api.roles.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {
    private final RoleRepository roleRepository;

    public Page<RoleResponse> list(Pageable pageable) {
        return roleRepository.findAll(pageable).map(RoleResponse::from);
    }

    @Transactional
    public RoleResponse create(RoleRequest request) {
        String name = request.name().trim();
        if (roleRepository.existsByName(name)) {
            throw duplicateRoleName(null);
        }

        try {
            return RoleResponse.from(roleRepository.saveAndFlush(new Role(name)));
        } catch (DataIntegrityViolationException exception) {
            throw duplicateRoleName(exception);
        }
    }

    private ResponseStatusException duplicateRoleName(Throwable cause) {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un rol con ese nombre.", cause);
    }
}
