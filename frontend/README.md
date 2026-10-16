# Frontend de intranet

SPA construida con React, Vite y TypeScript.

## Desarrollo

```bash
pnpm install
pnpm dev
```

También se puede iniciar con `docker compose up frontend` desde la raíz del repositorio.

## Rutas

Las rutas se definen como archivos dentro de `src/routes/`. TanStack Router genera `src/routeTree.gen.ts` a partir de esos archivos; no se debe editar manualmente.

TanStack Query está conectado globalmente mediante `QueryClientProvider`. Las consultas a la API se añadirán junto con las funcionalidades que las necesiten.
