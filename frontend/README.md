# Frontend de intranet

SPA construida con React, Vite y TypeScript.

## Desarrollo

```bash
pnpm install
pnpm dev
```

También se puede iniciar con `docker compose up frontend` desde la raíz del repositorio.

El hook `pre-commit` se configura al instalar las dependencias en el host con `pnpm install` desde `frontend/`. Compose no monta `.git`, así que ejecutar la instalación solo dentro del contenedor no configura el hook local.

## Comprobaciones

```bash
pnpm check       # Formato y lint
pnpm test        # Ejecutar tests una vez
pnpm test:watch  # Ejecutar tests en modo watch
pnpm build       # Comprobar tipos y generar la build
```

Los tests de componentes usan Vitest, React Testing Library y `user-event`.

## Rutas

Las rutas se definen como archivos dentro de `src/routes/`. TanStack Router genera `src/routeTree.gen.ts` a partir de esos archivos; no se debe editar manualmente.

TanStack Query está conectado globalmente mediante `QueryClientProvider`. Las consultas a la API se añadirán junto con las funcionalidades que las necesiten.

## Conexión con la API

El cliente compartido de `src/api.ts` envía las peticiones a `/api`. Durante el desarrollo, Vite reenvía esas peticiones al backend y retira ese prefijo: `/api/localities` llega a `/localities`.

En el host, el destino por defecto es `http://localhost:8080`. Si el backend usa otro puerto, configura `VITE_API_PROXY_TARGET` en el entorno del proceso que inicia Vite. Compose define `http://app:8080` para que el frontend localice al backend desde su contenedor; no necesita una regla de proxy por recurso.

Este proxy funciona en desarrollo. Para servir la build en producción, configura el servidor de despliegue para reenviar `/api` al backend y retirar el prefijo, o acuerda una estrategia de URL base antes de desplegar. `pnpm build` no incorpora el proxy de Vite a los archivos estáticos.

La API permite acceso anónimo temporalmente. La interfaz de gestión no sustituye la autorización del servidor; los roles se abordarán en su tarea correspondiente.

La build ejecuta Vite para regenerar las rutas antes de comprobar los tipos con TypeScript. No edites manualmente el árbol generado.
