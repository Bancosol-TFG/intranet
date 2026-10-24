package es.bancosol.api.stores.chain.service;

import java.time.Instant;
import es.bancosol.api.stores.chain.dto.ChainRequest;
import es.bancosol.api.stores.chain.dto.ChainResponse;
import es.bancosol.api.stores.chain.entity.Chain;
import es.bancosol.api.stores.chain.repository.ChainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChainService {
    private final ChainRepository repository;

    public Page<ChainResponse> list(String code, Pageable pageable) {
        return repository.findByCodeContainingIgnoreCase(code == null ? "" : code, pageable)
                .map(ChainResponse::from);
    }

    public ChainResponse get(Integer chainId) {
        return ChainResponse.from(findChain(chainId));
    }

    @Transactional
    public ChainResponse create(ChainRequest request) {
        checkDuplicate(repository.existsByCode(request.code()));
        return ChainResponse.from(repository.save(new Chain(request.code())));
    }

    @Transactional
    public ChainResponse update(Integer chainId, ChainRequest request) {
        Chain chain = findChain(chainId);
        checkDuplicate(repository.existsByCodeAndIdNot(request.code(), chainId));
        chain.setCode(request.code());
        return ChainResponse.from(chain);
    }

    @Transactional
    public void delete(Integer chainId) {
        findChain(chainId).setDeletedAt(Instant.now());
    }

    private Chain findChain(Integer chainId) {
        return repository.findById(chainId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private void checkDuplicate(boolean duplicate) {
        if (duplicate) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
    }
}
