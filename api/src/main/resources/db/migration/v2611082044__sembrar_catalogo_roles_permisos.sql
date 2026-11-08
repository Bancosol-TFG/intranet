CREATE TABLE role_permission_catalog_state (
    id INTEGER NOT NULL,
    initialized BOOLEAN NOT NULL,
    CONSTRAINT pk_role_permission_catalog_state PRIMARY KEY (id),
    CONSTRAINT ck_role_permission_catalog_state_singleton CHECK (id = 1)
);

INSERT INTO role_permission_catalog_state (id, initialized)
VALUES (1, FALSE);

UPDATE permissions
SET name = 'USER_CREATE',
    description = 'Dar de alta cuentas de usuario',
    updated_at = NOW()
WHERE name = 'users:create'
  AND deleted_at IS NULL;
