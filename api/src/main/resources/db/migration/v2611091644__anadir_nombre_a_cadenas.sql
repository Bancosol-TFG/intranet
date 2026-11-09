ALTER TABLE chains ADD COLUMN IF NOT EXISTS name VARCHAR;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM chains WHERE name IS NULL OR BTRIM(name) = '') THEN
        RAISE EXCEPTION 'Hay cadenas sin nombre. Asigna su nombre real a todas antes de repetir la migración.';
    END IF;
END $$;

ALTER TABLE chains ALTER COLUMN name SET NOT NULL;
ALTER TABLE chains ADD CONSTRAINT ck_chains_name_not_blank CHECK (BTRIM(name) <> '');
