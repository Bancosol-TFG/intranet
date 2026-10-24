# Tiendas

El módulo `stores` gestiona cadenas y tiendas en las tablas `chains` y `stores`. Sus clases se organizan por capas directamente en `es.bancosol.api.stores`: `controller`, `dto`, `entity`, `repository` y `service`.

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
- 409: código ya utilizado por otra cadena no borrada en alta o edición, o intento de borrar una cadena con tiendas no borradas.

Los errores usan el manejo por defecto de Spring. Temporalmente, la configuración de seguridad permite todas las peticiones sin credenciales, desactiva CSRF, HTTP Basic y el formulario de acceso y usa sesiones `STATELESS`. Las issues #35–#37 posponen la declaración de roles.


## Tiendas

Las tiendas se guardan en la tabla `stores`. Localidades (`locality_id`) y zonas (`zone_id`) quedan pendientes y no forman parte de la tabla ni del contrato actual.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/stores` | 200, listado paginado |
| GET | `/stores/{storeId}` | 200, detalle |
| POST | `/stores` | 201, tienda creada |
| PUT | `/stores/{storeId}` | 200, tienda actualizada |
| DELETE | `/stores/{storeId}` | 204, sin cuerpo |

Para crear o editar, envía `{"name":"Tienda centro","address":"Calle principal, 1","checkoutShelfs":0,"chainId":1}`. Todos los campos son obligatorios: `name` y `address` no pueden estar vacíos ni contener solo espacios; `checkoutShelfs` debe ser un entero mayor o igual que cero. La cadena debe existir y no estar borrada. La edición permite cambiar de cadena.

La respuesta contiene `id`, `name`, `address`, `checkoutShelfs` y `chain`, con `id` y `code` de la cadena. `GET /stores?page=0&size=10&sort=name,asc&chainId=1&name=centro` admite filtros opcionales combinables: `chainId` exacto y `name` parcial sin distinguir mayúsculas. Usa la misma estructura `content` y `page` que las cadenas.

### Borrado y errores de tiendas

El borrado lógico registra `deleted_at`; las tiendas borradas quedan fuera de listados, detalle, edición y borrado. El nombre distingue mayúsculas y es único solo entre tiendas no borradas, mediante `uq_stores_name`, por lo que puede reutilizarse tras la baja. Se conservan `created_at` y `updated_at`.

- 400: campos obligatorios ausentes, nulos o vacíos, cajas negativas o cadena inexistente o borrada. Una cadena inválida no guarda cambios.
- 404: tienda inexistente o borrada en detalle, edición o borrado.
- 409: nombre ya utilizado por otra tienda no borrada en alta o edición.

No se puede borrar una cadena mientras conserve alguna tienda no borrada: devuelve 409 y mantiene la cadena. Cuando todas sus tiendas están borradas, permite la baja con 204. El alta y cambio de cadena de una tienda y el borrado de la cadena bloquean su fila dentro de la transacción y revalidan su estado para coordinar operaciones concurrentes.

`StoreService.findStore(storeId)` devuelve la entidad de una tienda no borrada o lanza 404, para reutilizarla desde los horarios.

## Horario semanal

El submódulo `schedule` guarda en `schedules` los tramos de apertura de cada tienda. `weekDay` usa ISO: 1 es lunes y 7 es domingo. Cada día admite varios tramos.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/stores/{storeId}/schedules` | 200, los siete días sin paginación |
| POST | `/stores/{storeId}/schedules` | 201, tramo creado |
| PUT | `/stores/{storeId}/schedules/{scheduleId}` | 200, tramo actualizado |
| DELETE | `/stores/{storeId}/schedules/{scheduleId}` | 204, baja lógica |

Para crear o editar, envía `{"weekDay":1,"openingTime":"10:00","closingTime":"14:00"}`. Los tres campos son obligatorios; `weekDay` debe estar entre 1 y 7 y el cierre debe ser posterior a la apertura dentro del mismo día. La edición permite cambiar de día. POST y PUT devuelven `id`, `weekDay`, `openingTime` y `closingTime`.

GET devuelve una lista ordenada de siete objetos con `weekDay` y `slots`. Cada tramo contiene `id`, `openingTime` y `closingTime`, ordenado por apertura. Un día cerrado tiene `slots: []`.

Los intervalos son semiabiertos: `10:00–14:00` y `14:00–18:00` pueden coexistir. Se comprueba el solapamiento solo contra otros tramos no borrados de la misma tienda y día, excluyendo el propio al editar. Las escrituras bloquean la fila de la tienda durante la transacción para serializar la comprobación y el guardado. La baja registra `deleted_at`, conserva la auditoría y permite reutilizar el tramo horario.

- 400: campos ausentes o nulos, día fuera de 1–7 o cierre anterior o igual a la apertura.
- 404: tienda inexistente o borrada, o tramo inexistente, borrado o perteneciente a otra tienda al editar o borrar.
- 409: solapamiento con otro tramo activo.

La restricción de clase `@ValidTimeRange` y la interfaz `TimeRange`, en `schedule.dto`, permiten reutilizar la validación del orden de las horas. El validador delega los valores nulos a las restricciones de cada petición; `ScheduleRequest` exige ambas horas con `@NotNull`.


## Excepciones por fecha

Las excepciones de `schedule_exceptions` sustituyen todo el horario semanal de una fecha concreta. Se pueden guardar varios tramos de apertura o un único cierre completo.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/stores/{storeId}/schedule-exceptions` | 200, listado paginado |
| POST | `/stores/{storeId}/schedule-exceptions` | 201, excepción creada |
| PUT | `/stores/{storeId}/schedule-exceptions/{exceptionId}` | 200, excepción actualizada |
| DELETE | `/stores/{storeId}/schedule-exceptions/{exceptionId}` | 204, baja lógica |

Para abrir, envía `{"date":"2031-05-12","closed":false,"openingTime":"10:00","closingTime":"14:00"}`. Para cerrar, envía `{"date":"2031-05-12","closed":true}` sin horas o con ambas a `null`. POST y PUT devuelven `id`, `date`, `closed`, `openingTime` y `closingTime`. La fecha y `closed` son obligatorios. Un tramo abierto exige ambas horas y cierre posterior a apertura en el mismo día.

El listado admite `page`, `size`, `sort` y los filtros opcionales `from` y `to`, en formato ISO `YYYY-MM-DD`, con ambos límites incluidos. Por defecto ordena por `date` y `openingTime` ascendentes. Devuelve `content` y `page`, con `size`, `number`, `totalElements` y `totalPages`.

Los intervalos son semiabiertos: se admiten tramos adyacentes. Las escrituras bloquean la tienda durante la transacción. Las comprobaciones solo consideran excepciones no borradas de esa tienda y fecha, y excluyen la propia al editar. El borrado conserva la fila y su auditoría con `deleted_at` y permite reutilizar la fecha y las horas.

- 400: fecha o `closed` ausentes o nulos, fecha u horas mal formadas, cierre con horas, apertura sin ambas horas, cierre anterior o igual a apertura, o `from` posterior a `to`.
- 404: tienda inexistente o borrada, o excepción inexistente, borrada o de otra tienda al editar o borrar.
- 409: solapamiento con otro tramo, cierre en una fecha con tramos abiertos, apertura en una fecha cerrada o segundo cierre de la misma fecha. También se aplican al editar.

## Horario efectivo

`GET /stores/{storeId}/schedule?date=2031-05-12` devuelve `storeId`, `date`, `source`, `closed` y `slots`. Cada tramo de `slots` contiene `openingTime` y `closingTime`, ordenado por apertura.

Si existen excepciones no borradas para esa fecha, tienen prioridad sobre todos los tramos semanales: `source` es `EXCEPTION` y solo se devuelven sus tramos. Una excepción de cierre devuelve `closed: true` y `slots: []` aunque exista horario semanal.

Si no hay excepciones activas, `source` es `WEEKLY` y se usan los tramos semanales del día ISO de la fecha. Sin tramos semanales, devuelve `closed: true` y `slots: []`. Al borrar la última excepción se recupera el horario semanal.

La fecha es obligatoria: si falta o está mal formada devuelve 400. Una tienda inexistente o borrada devuelve 404.
