package es.bancosol.api.stores.service;

import java.time.Instant;
import es.bancosol.api.stores.entity.Chain;
import es.bancosol.api.stores.repository.ChainRepository;
import es.bancosol.api.stores.dto.StoreRequest;
import es.bancosol.api.stores.dto.StoreResponse;
import es.bancosol.api.stores.entity.Store;
import es.bancosol.api.stores.repository.StoreRepository;
import es.bancosol.api.territory.entity.Zone;
import es.bancosol.api.territory.repository.ZoneRepository;
import es.bancosol.api.territory.entity.Locality;
import es.bancosol.api.territory.repository.LocalityRepository;
import jakarta.persistence.EntityManager;
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
public class StoreService {
    private final StoreRepository repository;
    private final ChainRepository chainRepository;
    private final ZoneRepository zoneRepository;
    private final LocalityRepository localityRepository;
    private final EntityManager entityManager;

    public Page<StoreResponse> list(Integer chainId, Integer zoneId, Integer localityId, String name, Pageable pageable) {
        return repository.search(chainId, zoneId, localityId, name == null ? "" : name, pageable).map(StoreResponse::from);
    }

    public StoreResponse get(Integer storeId) {
        return StoreResponse.from(findStore(storeId));
    }

    public Store findStore(Integer storeId) {
        return repository.findById(storeId).filter(store -> store.getDeletedAt() == null)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public StoreResponse create(StoreRequest request) {
        Chain chain = lockChain(request.chainId());
        Zone zone = lockZone(request.zoneId());
        Locality locality = lockLocality(request.localityId());
        checkDuplicate(repository.existsByName(request.name()));
        Store store = new Store(request.name(), request.address(), request.checkoutShelfs(), chain, locality);
        store.setZone(zone);
        return StoreResponse.from(repository.save(store));
    }

    @Transactional
    public StoreResponse update(Integer storeId, StoreRequest request) {
        Store store = findStore(storeId);
        Chain chain = lockChain(request.chainId());
        Zone zone = lockZone(request.zoneId());
        Locality locality = lockLocality(request.localityId());
        checkDuplicate(repository.existsByNameAndIdNot(request.name(), storeId));
        store.setName(request.name());
        store.setAddress(request.address());
        store.setCheckoutShelfs(request.checkoutShelfs());
        store.setChain(chain);
        store.setZone(zone);
        store.setLocality(locality);
        return StoreResponse.from(store);
    }

    @Transactional
    public void delete(Integer storeId) {
        findStore(storeId).setDeletedAt(Instant.now());
    }

    private Chain lockChain(Integer chainId) {
        Chain chain = chainRepository.findByIdForUpdate(chainId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
        entityManager.refresh(chain);
        if (chain.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        return chain;
    }

    private void checkDuplicate(boolean duplicate) {
        if (duplicate) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
    }

    private Zone lockZone(Integer zoneId) {
        if (zoneId == null) {
            return null;
        }
        return zoneRepository.findForUpdate(zoneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
    }

    private Locality lockLocality(Integer localityId) {
        return localityRepository.findForUpdate(localityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
    }
}
