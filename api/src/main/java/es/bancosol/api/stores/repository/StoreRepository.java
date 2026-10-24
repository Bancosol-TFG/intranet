package es.bancosol.api.stores.repository;

import es.bancosol.api.stores.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StoreRepository extends JpaRepository<Store, Integer> {
    @Query("SELECT store FROM Store store WHERE (:chainId IS NULL OR store.chain.id = :chainId) "
            + "AND LOWER(store.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Store> search(Integer chainId, String name, Pageable pageable);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Integer id);
    boolean existsByChainIdAndDeletedAtIsNull(Integer chainId);
}
