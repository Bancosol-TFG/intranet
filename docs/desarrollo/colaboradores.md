# Colaboradores y contactos

El módulo `collaborator` gestiona colaboradores y sus contactos. Un colaborador tiene nombre, dirección y una localidad existente; los contactos pertenecen siempre al colaborador de la ruta. El correo es opcional y, si se informa, debe tener formato válido. El teléfono se conserva como texto.

## API

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET/POST | `/collaborators` | Listado paginado / alta (201) |
| GET/PUT/DELETE | `/collaborators/{collaboratorId}` | Detalle / edición / baja lógica (204) |
| GET/POST | `/collaborators/{collaboratorId}/contacts` | Contactos paginados / alta (201) |
| GET/PUT/DELETE | `/collaborators/{collaboratorId}/contacts/{contactId}` | Detalle / edición / baja lógica (204) |

El listado acepta `name`, `localityId`, `page`, `size` y `sort`. Los contactos usan paginación estándar. Las respuestas de listado contienen `content` y `page`.

Las altas y ediciones requieren nombre y dirección no vacíos y `localityId` de una localidad activa. Los contactos requieren nombre; `email` y `phoneNumber` son opcionales. Una ruta con padre inexistente o inactivo, o con un contacto que pertenezca a otro padre, devuelve 404. Los datos inválidos devuelven 400. Borrar una localidad utilizada por colaboradores activos devuelve 409.

Las bajas conservan las filas con `deleted_at`. Al dar de baja a un colaborador también se dan de baja sus contactos activos en la misma transacción. Las operaciones de colaborador y contacto bloquean primero la fila del colaborador; las operaciones que asignan localidad bloquean después la localidad. El borrado de localidad bloquea la localidad y luego consulta colaboradores activos sin bloquear filas de colaborador. Así se evita el ciclo de espera entre baja de localidad y cambios de colaboradores.

El acceso anónimo continúa permitido temporalmente por la configuración común de seguridad.
