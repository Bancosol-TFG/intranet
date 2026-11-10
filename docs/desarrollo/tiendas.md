# Tiendas

El módulo `stores` gestiona cadenas, tiendas y horarios en las tablas `chains`, `stores`, `schedules` y `schedule_exceptions`. Sus clases se organizan por capas directamente en `es.bancosol.api.stores`: `controller`, `dto`, `entity`, `repository` y `service`.

## Cadenas

Las peticiones y respuestas usan JSON. La respuesta de una cadena contiene `id`, `name` y `code`. El nombre es visible y puede repetirse; `id` identifica la fila y `code` es único entre cadenas no borradas.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/chains` | 200, listado paginado |
| GET | `/chains/{chainId}` | 200, detalle |
| POST | `/chains` | 201, cadena creada |
| PUT | `/chains/{chainId}` | 200, cadena actualizada |
| DELETE | `/chains/{chainId}` | 204, sin cuerpo |

Para crear o editar, envía `{"name":"Mercadona","code":"MER"}`. Tanto `name` como `code` son obligatorios; ninguno puede estar vacío ni contener solo espacios. El código debe ser único entre cadenas no borradas; la comparación de unicidad distingue mayúsculas.

### Vista de cadenas

Accede a «Cadenas» desde la navegación o abre `/chains`. El formulario permite crear y editar el nombre y el código, ambos obligatorios. El listado muestra ambos campos, admite búsqueda por código y paginación. «Dar de baja» pide confirmación; si la cadena conserva tiendas activas, se muestra el mensaje de conflicto del cliente compartido.

Los endpoints de cadenas exigen los permisos `CHAIN_LIST`, `CHAIN_READ`, `CHAIN_CREATE`, `CHAIN_UPDATE` y `CHAIN_DELETE` según la operación.

### Migración de cadenas existentes

La migración añade `name` obligatorio sin inventar nombres ni imponer su unicidad. Si hay cadenas sin nombre, incluidas las dadas de baja, se detiene. Prepara la columna y completa el nombre real antes de reiniciar la API:

```sql
ALTER TABLE chains ADD COLUMN IF NOT EXISTS name VARCHAR;
SELECT id, code, deleted_at FROM chains WHERE name IS NULL OR BTRIM(name) = '';
UPDATE chains SET name = '<nombre_real>' WHERE id = <id_cadena>;
```

Repite el `UPDATE` para cada cadena. Flyway comprueba que ninguna tenga el nombre vacío, añade `NOT NULL` y la restricción `ck_chains_name_not_blank`. Los clientes de POST y PUT deben enviar ahora `name` y `code`; las respuestas también incluyen el nombre dentro de `chain` en las tiendas.

### Listado

`GET /chains?page=0&size=2&sort=code,desc&code=cad` filtra por coincidencia parcial de `code` sin distinguir mayúsculas. `code` es opcional. La paginación empieza en cero y admite `page`, `size` y `sort`.

La respuesta contiene `content` y `page`, con `size`, `number`, `totalElements` y `totalPages` dentro de `page`.

### Borrado y errores

El borrado es lógico: conserva la fila y registra `deleted_at`. Las cadenas borradas no aparecen en los listados ni están disponibles para detalle, edición o borrado. Su código puede reutilizarse gracias al índice único parcial `uq_chains_code`, aplicado solo donde `deleted_at IS NULL`. Hibernate gestiona `created_at` y `updated_at`.

- 400: `name` o `code` ausente, nulo, vacío o compuesto solo por espacios en alta o edición.
- 404: cadena inexistente o borrada en detalle, edición o borrado.
- 409: código ya utilizado por otra cadena no borrada en alta o edición, o intento de borrar una cadena con tiendas no borradas.

Los errores usan el manejo por defecto de Spring. Los endpoints de cadenas exigen una sesión autenticada, el permiso correspondiente y, si procede, el cambio de contraseña inicial (ver [autenticación](autenticacion.md)).


## Tiendas

Las tiendas se guardan en la tabla `stores`. Cada tienda pertenece a una localidad activa y puede tener una zona activa.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/stores` | 200, listado paginado |
| GET | `/stores/{storeId}` | 200, detalle |
| POST | `/stores` | 201, tienda creada |
| PUT | `/stores/{storeId}` | 200, tienda actualizada |
| DELETE | `/stores/{storeId}` | 204, sin cuerpo |

Para crear o editar, envía `{"name":"Tienda centro","address":"Calle principal, 1","checkoutShelfs":0,"chainId":1,"localityId":1}`. Todos los campos son obligatorios: `name` y `address` no pueden estar vacíos ni contener solo espacios; `checkoutShelfs` debe ser un entero mayor o igual que cero. La cadena y la localidad deben existir y no estar borradas. La edición permite cambiar ambas relaciones.

La respuesta contiene `id`, `name`, `address`, `checkoutShelfs` y `chain`, con `id`, `name` y `code` de la cadena. `GET /stores?page=0&size=10&sort=name,asc&chainId=1&name=centro` admite filtros opcionales combinables: `chainId` exacto y `name` parcial sin distinguir mayúsculas. Usa la misma estructura `content` y `page` que las cadenas.

Para asociar una zona, incluye `zoneId` en el alta o la edición. La zona debe existir y estar activa; si se omite o es `null`, la tienda queda sin zona. La respuesta incluye `zone` con `id`, `name` y `code`, o `null` si no tiene zona. `GET /stores?zoneId=1` permite consultar las tiendas activas de una zona y combinar el filtro con los demás. No se puede dar de baja una zona que tenga tiendas activas: la API responde 409.

La respuesta incluye `locality` con `id`, `name` y `postalCode`. `GET /stores?localityId=1` permite consultar las tiendas activas de una localidad. Una localidad utilizada por tiendas activas no se puede dar de baja y responde 409.

### Vista de tiendas

Accede a «Tiendas» desde la navegación o abre `/stores`. El listado muestra nombre, dirección, número de cajas, cadena, localidad y zona. Puedes filtrar por nombre y cadena y recorrer las páginas del listado.

Para crear una tienda, introduce nombre y dirección, un número entero de cajas mayor o igual que cero, y selecciona cadena y localidad. La zona es opcional: «Sin zona» envía `zoneId: null`. Los selectores cargan todas las páginas de cadenas, localidades y zonas activas; la cadena muestra su nombre y código, y la localidad su nombre y código postal.

«Editar» carga todos los campos y permite cambiar cadena, localidad y zona, o retirar esta última. «Cancelar» vuelve al formulario de alta. «Dar de baja» solicita confirmación y, al completarse, actualiza el listado. El guardado y la baja vuelven a la primera página.

Mientras se cargan las opciones o si falla alguna de ellas, el formulario bloquea el guardado. Si faltan cadenas o localidades, muestra que debes crearlas antes. Los errores del guardado o la baja se muestran con el mensaje del cliente compartido; el conflicto por nombre duplicado conserva los valores introducidos.

La API exige los permisos `STORE_LIST`, `STORE_READ`, `STORE_CREATE`, `STORE_UPDATE` o `STORE_DELETE` según la operación. La carga de los selectores requiere también `CHAIN_LIST`, `LOCALITY_LIST` y `ZONE_LIST`.

### Migración de tiendas existentes

La migración exige una localidad en todas las tiendas, incluidas las dadas de baja. Si ya existen tiendas, se detiene sin asignar valores. Antes de reintentarla, prepara la columna en la base de datos y asigna a cada tienda su localidad real; las tiendas activas deben apuntar a localidades activas:

```sql
ALTER TABLE stores ADD COLUMN IF NOT EXISTS locality_id INTEGER;
SELECT id, name, address, deleted_at FROM stores WHERE locality_id IS NULL;
UPDATE stores SET locality_id = <id_localidad> WHERE id = <id_tienda>;
```

Repite el `UPDATE` con los identificadores correctos para cada tienda y comprueba que la consulta no devuelve filas. Reinicia la API para que Flyway complete la migración, compruebe la referencia y haga obligatoria la columna.

### Borrado y errores de tiendas

El borrado lógico registra `deleted_at`; las tiendas borradas quedan fuera de listados, detalle, edición y borrado. El nombre distingue mayúsculas y es único solo entre tiendas no borradas, mediante `uq_stores_name`, por lo que puede reutilizarse tras la baja. Se conservan `created_at` y `updated_at`.

- 400: campos obligatorios ausentes, nulos o vacíos, cajas negativas, cadena o localidad inexistente o borrada, o zona inexistente o borrada. Una relación inválida no guarda cambios.
- 404: tienda inexistente o borrada en detalle, edición o borrado.
- 409: nombre ya utilizado por otra tienda no borrada en alta o edición.

No se puede borrar una cadena mientras conserve alguna tienda no borrada: devuelve 409 y mantiene la cadena. Cuando todas sus tiendas están borradas, permite la baja con 204. El alta y cambio de cadena de una tienda y el borrado de la cadena bloquean su fila dentro de la transacción y revalidan su estado para coordinar operaciones concurrentes.

`StoreService.findStore(storeId)` devuelve la entidad de una tienda no borrada o lanza 404, para reutilizarla desde los horarios.

## Horario semanal

Desde el listado de tiendas, pulsa «Horarios» para abrir `/stores/{storeId}/schedule`. La página muestra el nombre de la tienda y los siete días, de lunes a domingo. Un día sin tramos aparece como «Cerrado».

«Añadir tramo» abre el formulario del día. Introduce apertura y cierre; el cierre debe ser posterior a la apertura. Puedes guardar varios tramos por día. Se muestran ordenados por apertura y con horas en formato `HH:mm`. Los botones «Editar tramo» y «Borrar tramo» aparecen junto a las horas; el borrado solicita confirmación.

Los cambios actualizan el horario de la tienda. Un solapamiento muestra «El tramo se solapa con otro del mismo día» y conserva el formulario para corregirlo. Si la tienda no existe, se muestra el error en lugar del horario. «Volver a tiendas» regresa al listado.

La cabecera requiere `STORE_READ`; el horario requiere `SCHEDULE_LIST` y las escrituras `SCHEDULE_CREATE`, `SCHEDULE_UPDATE` o `SCHEDULE_DELETE`. Las excepciones y el horario efectivo se incorporarán en la siguiente tarea.

Los tramos de apertura de cada tienda se guardan en `schedules`. `weekDay` usa ISO: 1 es lunes y 7 es domingo. Cada día admite varios tramos.

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

La restricción de clase `@ValidTimeRange` y la interfaz `TimeRange`, en `es.bancosol.api.stores.dto`, permiten reutilizar la validación del orden de las horas. El validador delega los valores nulos a las restricciones de cada petición; `ScheduleRequest` exige ambas horas con `@NotNull`.


## Excepciones por fecha

Las excepciones de `schedule_exceptions` sustituyen todo el horario semanal de una fecha concreta. Se pueden guardar varios tramos de apertura o un único cierre completo.

En la página de horarios, «Añadir excepción» abre el formulario. Selecciona una fecha y marca «Cerrado todo el día» para indicar un cierre. Si la tienda abre, deja la casilla desmarcada y pulsa «Añadir tramo» para introducir cada hora de apertura y cierre. Puedes quitar un tramo antes de guardar.

El listado permite filtrar por fechas, editar un día, eliminar un tramo o borrar todas las excepciones de un día. El horario efectivo muestra para una fecha si se aplica una excepción o el horario semanal. La edición del día completo se guarda de forma transaccional; si otra persona cambia el día, se rechaza la operación y se actualiza el listado para volver a intentarlo.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/stores/{storeId}/schedule-exceptions` | 200, listado paginado |
| POST | `/stores/{storeId}/schedule-exceptions` | 201, excepción creada |
| PUT | `/stores/{storeId}/schedule-exceptions/{exceptionId}` | 200, excepción actualizada |
| DELETE | `/stores/{storeId}/schedule-exceptions/{exceptionId}` | 204, baja lógica |
| PUT | `/stores/{storeId}/schedule-exceptions/day` | 200, sustituye atómicamente la excepción de un día |

La vista guarda un día completo mediante `PUT /stores/{storeId}/schedule-exceptions/day`. Envía `originalDate` (fecha anterior, o `null` para un día nuevo), `date`, `closed`, `slots` y `expected`. Cada tramo de `slots` contiene `openingTime`, `closingTime` y, al conservar un tramo existente, `id`. Para un cierre, `slots` es una lista vacía. Para eliminar todas las excepciones de un día existente, envía `closed: false` y `slots: []`. `expected` contiene las filas originales completas (`id`, `date`, `closed`, `openingTime`, `closingTime`) o una lista vacía para un día nuevo. Si otra operación cambió esas filas o la fecha de destino ya tiene excepciones, devuelve 409 sin guardar el cambio. Para acceder se requieren los permisos `SCHEDULE_EXCEPTION_CREATE`, `SCHEDULE_EXCEPTION_UPDATE` y `SCHEDULE_EXCEPTION_DELETE`.

El backend bloquea la tienda, valida el resultado completo y guarda la sustitución en una transacción. La vista usa el borrado individual para un único tramo; para eliminar un día con varios tramos usa la sustitución transaccional.

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
