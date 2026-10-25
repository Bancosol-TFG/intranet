# Campañas

El módulo `campaigns` gestiona los tipos de campaña en la tabla `campaign_types` y, más adelante, las campañas. Sus clases se organizan por capas en `es.bancosol.api.campaigns`: `controller`, `dto`, `entity`, `repository` y `service`.

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
- 409: nombre ya utilizado por otro tipo no borrado en alta o edición.

Los errores usan el manejo por defecto de Spring. Temporalmente, la configuración de seguridad permite todas las peticiones sin credenciales. Los roles acordados son administrador para la gestión y cualquier usuario autenticado para las consultas; su declaración queda pendiente de la implementación de la autenticación.

## Interfaz

La ruta `/campaign-types` de la intranet permite crear, consultar, editar y eliminar tipos de campaña. El formulario valida que el nombre no esté vacío, el listado permite buscar por nombre y la paginación muestra diez registros por página. El frontend llama a la API mediante rutas relativas; Vite las redirige al backend con la variable `VITE_API_PROXY_TARGET`.
