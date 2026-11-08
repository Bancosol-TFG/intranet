# Prototipo temporal de roles y permisos

`frontend/roles-permissions-prototype/` es un subproyecto temporal para probar
la gestión de roles y permisos. En breve habrá que adaptarlo e integrarlo en el
frontend principal. No se debe mantener como una aplicación separada a largo
plazo.

El prototipo no modifica las rutas ni los componentes compartidos del frontend
principal. Tampoco implementa login ni simula credenciales.

## Ejecutar

Arranca la API y PostgreSQL con el entorno local. Desde `frontend/`, inicia el
prototipo con:

```sh
pnpm exec vite --config roles-permissions-prototype/vite.config.ts --host 0.0.0.0 --port 5174
```

Abre `http://localhost:5174`. El servidor reenvía las peticiones `/api` a
`http://localhost:8080`. Para cambiar el destino, define
`VITE_API_PROXY_TARGET`.

La API exige una autenticación con los permisos de gestión correspondientes.
Hasta que la autenticación aporte esas authorities, el prototipo mostrará el
error de autorización. No se debe abrir la API ni simular una identidad para
evitar esa denegación.

## Primer administrador

La carga inicial de `IF_EMPTY` y cada sincronización `FORCE` leen desde YAML el
catálogo de roles y permisos; `ADMIN` incluye los permisos declarados en
`admin.yaml`. La migración actual no siembra ese catálogo. La creación de la
cuenta inicial es independiente de la sincronización y depende de `ADMIN_EMAIL`
y `ADMIN_PASSWORD`.

Consulta [Roles y permisos](roles-permisos.md) para más detalles.

## Comprobar

Desde `frontend/`, ejecuta las pruebas del cliente de API y compila el
prototipo:

```sh
pnpm exec vitest run --config roles-permissions-prototype/vite.config.ts
pnpm exec tsc --noEmit --project roles-permissions-prototype/tsconfig.json
pnpm exec vite build --config roles-permissions-prototype/vite.config.ts
```
