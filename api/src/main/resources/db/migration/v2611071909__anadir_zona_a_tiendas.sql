ALTER TABLE stores
    ADD COLUMN zone_id INTEGER CONSTRAINT fk_stores_zones REFERENCES zones(id);

CREATE INDEX idx_stores_zone_id ON stores(zone_id);
