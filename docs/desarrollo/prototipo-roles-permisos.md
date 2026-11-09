# Gestión de roles y permisos

La gestión de roles y permisos está integrada en la aplicación principal, en la ruta `/roles`. Inicia sesión y abre «Roles y permisos» en la navegación. La vista permite crear roles y consultar, asignar o retirar los permisos del catálogo. Solo se cargan los primeros 100 roles, ordenados por nombre.

La API comprueba cada operación: `ROLE_LIST`, `ROLE_CREATE`, `PERMISSION_LIST`, `ROLE_PERMISSION_LIST`, `ROLE_PERMISSION_ASSIGN` y `ROLE_PERMISSION_REVOKE`. Una respuesta 403 indica que la sesión no tiene el permiso necesario. La renovación y el cierre de sesión caducada utilizan el cliente compartido.

La migración garantiza la existencia del rol `ADMIN`; `PermissionCatalogSynchronizer` le asigna los permisos declarados que le falten. La cuenta inicial se crea al configurar `ADMIN_EMAIL` y `ADMIN_PASSWORD`, sin credenciales predeterminadas. Consulta [autenticación](autenticacion.md) para el inicio de sesión y la configuración.

Desde `frontend/`, ejecuta `pnpm check`, `pnpm test` y `pnpm build`. Comprueba también el flujo con una sesión autorizada y otra sin permisos.
