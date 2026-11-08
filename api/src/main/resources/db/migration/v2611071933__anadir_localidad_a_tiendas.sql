ALTER TABLE stores ADD COLUMN IF NOT EXISTS locality_id INTEGER;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM stores WHERE locality_id IS NULL) THEN
        RAISE EXCEPTION 'Hay tiendas sin localidad. Asigna locality_id a todas antes de repetir la migración.';
    END IF;
END $$;

ALTER TABLE stores ALTER COLUMN locality_id SET NOT NULL;
ALTER TABLE stores ADD CONSTRAINT fk_stores_localities FOREIGN KEY (locality_id) REFERENCES localities(id);
CREATE INDEX idx_stores_locality_id ON stores(locality_id);
