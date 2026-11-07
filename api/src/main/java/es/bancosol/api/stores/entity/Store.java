package es.bancosol.api.stores.entity;

import java.time.Instant;
import es.bancosol.api.stores.entity.Chain;
import es.bancosol.api.territory.entity.Zone;
import es.bancosol.api.territory.entity.Locality;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "stores")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chain_id", nullable = false)
    private Chain chain;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private Zone zone;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "locality_id", nullable = false)
    private Locality locality;

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    @Column(nullable = false)
    private String address;

    @Setter
    @Column(nullable = false)
    private Integer checkoutShelfs;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    @Setter
    private Instant deletedAt;

    public Store(String name, String address, Integer checkoutShelfs, Chain chain, Locality locality) {
        this.name = name;
        this.address = address;
        this.checkoutShelfs = checkoutShelfs;
        this.chain = chain;
        this.locality = locality;
    }
}
