package es.bancosol.api.stores.entity;

import java.time.Instant;
import java.time.LocalTime;
import es.bancosol.api.stores.entity.Store;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "schedules")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Setter
    @Column(nullable = false)
    private Integer weekDay;

    @Setter
    @Column(nullable = false)
    private LocalTime openingTime;

    @Setter
    @Column(nullable = false)
    private LocalTime closingTime;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    @Setter
    private Instant deletedAt;

    public Schedule(Store store, Integer weekDay, LocalTime openingTime, LocalTime closingTime) {
        this.store = store;
        this.weekDay = weekDay;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
    }
}
