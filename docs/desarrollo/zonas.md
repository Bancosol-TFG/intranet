# Zonas

La API permite consultar, crear, actualizar y borrar zonas desde `/zones`. El borrado es lógico: las zonas eliminadas dejan de aparecer en consultas, pero el nombre permanece reservado por la restricción única global.

La interfaz web solicita `/api/zones`; el proxy de desarrollo retira `/api` antes de reenviar la petición al backend.

## API

- `GET /zones`: listado paginado. Acepta filtros parciales sin distinguir mayúsculas (`name`, `code`) y los parámetros habituales de paginación (`page`, `size`, `sort`).
- `GET /zones/{zoneId}`: consulta una zona activa.
- `POST /zones`: crea una zona con `name` y `code` no vacíos; responde `201`.
- `PUT /zones/{zoneId}`: actualiza nombre y código.
- `DELETE /zones/{zoneId}`: marca la zona como eliminada; responde `204`.

Las consultas a una zona inexistente o eliminada responden `404`. Un nombre duplicado, incluso si pertenece a una zona eliminada, responde `409`. El código puede repetirse.

## Interfaz

Abre `/zones` para buscar, paginar y mantener zonas. El formulario permite crear y editar; la interfaz solicita confirmación antes del borrado.
