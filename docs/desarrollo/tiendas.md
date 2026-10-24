# Tiendas

El módulo `stores` agrupa los submódulos relacionados con tiendas. El submódulo `chain` gestiona las cadenas en la tabla `chains`.

## Cadenas

Las peticiones y respuestas usan JSON. La respuesta de una cadena contiene `id` y `code`.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/chains` | 200, listado paginado |
| GET | `/chains/{chainId}` | 200, detalle |
| POST | `/chains` | 201, cadena creada |
| PUT | `/chains/{chainId}` | 200, cadena actualizada |
| DELETE | `/chains/{chainId}` | 204, sin cuerpo |

Para crear o editar, envía `{"code":"CADENA"}`. `code` es obligatorio y no puede estar vacío ni contener solo espacios. Debe ser único entre cadenas no borradas; la comparación de unicidad distingue mayúsculas.

### Listado

`GET /chains?page=0&size=2&sort=code,desc&code=cad` filtra por coincidencia parcial de `code` sin distinguir mayúsculas. `code` es opcional. La paginación empieza en cero y admite `page`, `size` y `sort`.

La respuesta contiene `content` y `page`, con `size`, `number`, `totalElements` y `totalPages` dentro de `page`.

### Borrado y errores

El borrado es lógico: conserva la fila y registra `deleted_at`. Las cadenas borradas no aparecen en los listados ni están disponibles para detalle, edición o borrado. Su código puede reutilizarse gracias al índice único parcial `uq_chains_code`, aplicado solo donde `deleted_at IS NULL`. Hibernate gestiona `created_at` y `updated_at`.

- 400: `code` ausente, nulo, vacío o compuesto solo por espacios en alta o edición.
- 404: cadena inexistente o borrada en detalle, edición o borrado.
- 409: código ya utilizado por otra cadena no borrada en alta o edición.

Los errores usan el manejo por defecto de Spring. Temporalmente, la configuración de seguridad permite todas las peticiones sin credenciales, desactiva CSRF, HTTP Basic y el formulario de acceso y usa sesiones `STATELESS`. Las issues #35–#37 posponen la declaración de roles. Las tiendas y el bloqueo del borrado de cadenas con tiendas quedan fuera de este cambio.
