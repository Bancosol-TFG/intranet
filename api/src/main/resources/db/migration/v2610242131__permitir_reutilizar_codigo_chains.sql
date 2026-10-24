ALTER TABLE chains DROP CONSTRAINT uq_chains_code;

CREATE UNIQUE INDEX uq_chains_code ON chains (code) WHERE deleted_at IS NULL;
