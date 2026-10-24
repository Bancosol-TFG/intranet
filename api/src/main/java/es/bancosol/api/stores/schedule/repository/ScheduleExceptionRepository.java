package es.bancosol.api.stores.schedule.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import es.bancosol.api.stores.schedule.entity.ScheduleException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ScheduleExceptionRepository extends JpaRepository<ScheduleException, Integer>,
        JpaSpecificationExecutor<ScheduleException> {
    List<ScheduleException> findByStoreIdAndDateOrderByOpeningTimeAsc(Integer storeId, LocalDate date);
    Optional<ScheduleException> findByIdAndStoreId(Integer id, Integer storeId);
}
