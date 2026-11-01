# Localidades

El módulo `territory` gestiona localidades en la tabla `localities`. El recurso expone `id`, `name` y `postalCode`. El nombre y el código postal son obligatorios y no pueden estar vacíos ni contener solo espacios. El código postal se conserva como texto para admitir ceros iniciales y formatos distintos; no se aplica una expresión regular ni una regla de unicidad.

## API

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/localities` | 200, listado paginado |
| GET | `/localities/{localityId}` | 200, detalle |
| POST | `/localities` | 201, localidad creada |
| PUT | `/localities/{localityId}` | 200, localidad actualizada |
| DELETE | `/localities/{localityId}` | 204, sin cuerpo |

Envía `{"name":"Madrid","postalCode":"28001"}` para crear o actualizar.

`GET /localities?name=mad&postalCode=280&page=0&size=10&sort=name,asc` busca coincidencias parciales sin distinguir mayúsculas y permite combinar ambos filtros. La paginación empieza en cero y la respuesta contiene `content` y `page`, con `size`, `number`, `totalElements` y `totalPages`.

El borrado es lógico: las localidades borradas no aparecen en listados ni están disponibles para detalle, edición o borrado. La tabla conserva `created_at`, `updated_at` y `deleted_at`.

- 400: falta el nombre o el código postal, o está vacío o compuesto solo por espacios.
- 404: localidad inexistente o borrada.

Los endpoints exigen un token de acceso válido (ver [autenticación](autenticacion.md)). Esta entrega no establece roles permanentes. Un módulo posterior de colaboradores deberá coordinar el alta y el borrado mediante el bloqueo pesimista de localidad disponible en el repositorio; este CRUD todavía no comprueba colaboradores asociados.
