package es.bancosol.api.roles.service;

import java.util.List;
import es.bancosol.api.roles.dto.PermissionResponse;
import es.bancosol.api.roles.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermissionService {
    private final PermissionRepository permissionRepository;

    public List<PermissionResponse> list() {
        return permissionRepository.findByDeletedAtIsNullOrderByNameAsc().stream()
                .map(PermissionResponse::from)
                .toList();
    }
}
