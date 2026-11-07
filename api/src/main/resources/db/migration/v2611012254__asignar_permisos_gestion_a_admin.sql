INSERT INTO roles (name)
VALUES ('ADMIN')
ON CONFLICT (name) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO permissions (name, description)
VALUES
    ('ROLE_LIST', 'Consultar el listado de roles'),
    ('ROLE_CREATE', 'Crear roles'),
    ('PERMISSION_LIST', 'Consultar el catálogo de permisos'),
    ('ROLE_PERMISSION_LIST', 'Consultar los permisos de un rol'),
    ('ROLE_PERMISSION_ASSIGN', 'Asignar permisos a un rol'),
    ('ROLE_PERMISSION_REVOKE', 'Retirar permisos de un rol')
ON CONFLICT (name) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'ROLE_LIST',
    'ROLE_CREATE',
    'PERMISSION_LIST',
    'ROLE_PERMISSION_LIST',
    'ROLE_PERMISSION_ASSIGN',
    'ROLE_PERMISSION_REVOKE'
)
WHERE roles.name = 'ADMIN'
  AND roles.deleted_at IS NULL
  AND permissions.deleted_at IS NULL
ON CONFLICT (role_id, permission_id) WHERE deleted_at IS NULL DO NOTHING;
