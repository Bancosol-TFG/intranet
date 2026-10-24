package es.bancosol.api.stores.repository;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import es.bancosol.api.stores.entity.Chain;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChainRepository extends JpaRepository<Chain, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT chain FROM Chain chain WHERE chain.id = :chainId")
    Optional<Chain> findByIdForUpdate(Integer chainId);

    Page<Chain> findByCodeContainingIgnoreCase(String code, Pageable pageable);
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Integer id);
}
