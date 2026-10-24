package es.bancosol.api.stores.schedule.repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import es.bancosol.api.stores.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
    List<Schedule> findByStoreIdOrderByWeekDayAscOpeningTimeAsc(Integer storeId);
    Optional<Schedule> findByIdAndStoreId(Integer id, Integer storeId);

    @Query("SELECT COUNT(schedule) > 0 FROM Schedule schedule WHERE schedule.store.id = :storeId "
            + "AND schedule.weekDay = :weekDay AND schedule.id <> :excludedId "
            + "AND schedule.openingTime < :closingTime AND schedule.closingTime > :openingTime")
    boolean overlaps(Integer storeId, Integer weekDay, LocalTime openingTime, LocalTime closingTime, Integer excludedId);
}
