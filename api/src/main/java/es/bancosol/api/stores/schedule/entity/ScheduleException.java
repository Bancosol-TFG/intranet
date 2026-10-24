package es.bancosol.api.stores.schedule.entity;

import java.time.Instant;
import java.time.LocalTime;
import java.time.LocalDate;
import es.bancosol.api.stores.store.entity.Store;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "schedule_exceptions")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor
public class ScheduleException {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Setter
    @Column(nullable = false)
    private LocalDate date;

    @Setter
    @Column(nullable = false)
    private boolean closed;

    @Setter
    private LocalTime openingTime;

    @Setter
    private LocalTime closingTime;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    @Setter
    private Instant deletedAt;

    public ScheduleException(Store store, LocalDate date, boolean closed, LocalTime openingTime, LocalTime closingTime) {
        this.store = store;
        this.date = date;
        this.closed = closed;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
    }
}
