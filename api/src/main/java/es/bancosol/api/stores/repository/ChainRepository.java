package es.bancosol.api.stores.repository;

import es.bancosol.api.stores.entity.Chain;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChainRepository extends JpaRepository<Chain, Integer> {
    Page<Chain> findByCodeContainingIgnoreCase(String code, Pageable pageable);
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Integer id);
}
