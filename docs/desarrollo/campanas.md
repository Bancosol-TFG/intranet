# Campañas

El módulo `campaigns` gestiona los tipos de campaña en la tabla `campaign_types` y las campañas en la tabla `campaigns`. Sus clases se organizan por capas en `es.bancosol.api.campaigns`: `controller`, `dto`, `entity`, `repository` y `service`.

## Tipos de campaña

Las peticiones y respuestas usan JSON. La respuesta de un tipo de campaña contiene `id` y `name`.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/campaign-types` | 200, listado paginado |
| GET | `/campaign-types/{campaignTypeId}` | 200, detalle |
| POST | `/campaign-types` | 201, tipo creado |
| PUT | `/campaign-types/{campaignTypeId}` | 200, tipo actualizado |
| DELETE | `/campaign-types/{campaignTypeId}` | 204, sin cuerpo |

Para crear o editar, envía `{"name":"ALIMENTACIÓN"}`. `name` es obligatorio y no puede estar vacío ni contener solo espacios. Debe ser único entre los tipos no borrados; la comparación de unicidad distingue mayúsculas.

### Listado

`GET /campaign-types?page=0&size=2&sort=name,desc&name=ali` filtra por coincidencia parcial de `name` sin distinguir mayúsculas. `name` es opcional. La paginación empieza en cero y admite `page`, `size` y `sort`.

La respuesta contiene `content` y `page`, con `size`, `number`, `totalElements` y `totalPages` dentro de `page`.

### Borrado y errores

El borrado es lógico: conserva la fila y registra `deleted_at`. Los tipos borrados no aparecen en los listados ni están disponibles para detalle, edición o borrado. Su nombre puede reutilizarse gracias al índice único parcial `uq_campaign_types_name`, aplicado solo donde `deleted_at IS NULL`. Hibernate gestiona `created_at` y `updated_at`.

- 400: `name` ausente, nulo, vacío o compuesto solo por espacios en alta o edición.
- 404: tipo inexistente o borrado en detalle, edición o borrado.
- 409: nombre ya utilizado por otro tipo no borrado en alta o edición, o tipo asociado a alguna campaña no borrada al borrar.

Los errores usan el manejo por defecto de Spring. Temporalmente, la configuración de seguridad permite todas las peticiones sin credenciales. Los roles acordados son administrador para la gestión y cualquier usuario autenticado para las consultas; su declaración queda pendiente de la implementación de la autenticación.

## Campañas

La respuesta de una campaña contiene `id`, `name`, `campaignTypeId`, `campaignTypeName`, `startDate` y `endDate`. Las fechas usan el formato `YYYY-MM-DD`.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/campaigns` | 200, listado paginado |
| GET | `/campaigns/{campaignId}` | 200, detalle |
| POST | `/campaigns` | 201, campaña creada |
| PUT | `/campaigns/{campaignId}` | 200, campaña actualizada |
| DELETE | `/campaigns/{campaignId}` | 204, sin cuerpo |

Para crear o editar, envía `{"name":"Gran Recogida","campaignTypeId":1,"startDate":"2026-11-02","endDate":"2026-11-20"}`. Todos los campos son obligatorios. El tipo debe existir y no estar borrado. La fecha de fin no puede ser anterior a la fecha de inicio; sí puede coincidir con ella. El nombre de la campaña no es único.

### Listado

`GET /campaigns?page=0&size=10&sort=startDate,desc&name=recogida&campaignTypeId=1` filtra por coincidencia parcial de `name` sin distinguir mayúsculas y por tipo. Ambos filtros son opcionales. La paginación funciona igual que en los tipos de campaña.

### Borrado y errores

El borrado es lógico y conserva `deleted_at`. Las campañas borradas no aparecen en los listados ni están disponibles para detalle, edición o borrado. Mientras una campaña no borrada use un tipo, ese tipo no se puede borrar.

- 400: campos ausentes, `name` vacío o compuesto solo por espacios, o fecha de fin anterior a la de inicio en alta o edición.
- 404: campaña inexistente o borrada, o tipo inexistente o borrado, en detalle, alta o edición.
- 409: intento de borrar un tipo asociado a una campaña no borrada.

## Interfaz

La ruta `/campaign-types` de la intranet permite crear, consultar, editar y eliminar tipos de campaña y campañas. El formulario valida que el nombre no esté vacío, el listado permite buscar por nombre y la paginación muestra diez registros por página. El frontend usa `VITE_BACKEND_URL` como URL base obligatoria de sus peticiones; no tiene valor por defecto y la aplicación se detiene si falta. Las llamadas a la API están en `frontend/src/api/`, con un módulo por recurso y un wrapper común en `client.ts`.
