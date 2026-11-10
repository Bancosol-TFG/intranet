# ADR-0022: Gestión de roles con catálogo versionado

## Estado
Accepted

## Contexto
Los roles y sus permisos se declararán en YAML para inicializar y comprobar el catálogo. La API actual también permite crear roles y asignarles o retirarles permisos en tiempo de ejecución. Exigir siempre la igualdad entre YAML y PostgreSQL impediría conservar esos cambios después de un reinicio; ignorar toda diferencia impediría validar despliegues que requieran un catálogo controlado.

## Opciones consideradas
1. **YAML como única autoridad:** retirar los endpoints que mutan roles y asignaciones.
2. **PostgreSQL como única autoridad en tiempo de ejecución:** usar YAML solo como ejemplo o eliminar la comparación de roles y asignaciones.
3. **Autoridad según el modo:** conservar los mutadores y definir cuándo se inicializan, validan o reconcilian los datos de roles.

## Decisión
Se elige la autoridad según el modo y se conservan los endpoints actuales para crear roles y cambiar sus permisos.

- `IF_EMPTY` carga roles y asignaciones desde YAML solo cuando el marcador persistido indica que el catálogo no se ha inicializado. Tras validar la carga, marca la inicialización en la misma transacción. En arranques posteriores tolera diferencias de roles y asignaciones en PostgreSQL para conservar los cambios realizados mediante API; sigue validando la estructura YAML, la igualdad de permisos enum/YAML/BD y los permisos de endpoints contra BD.
- `CHECK` no escribe y exige igualdad exacta de permisos enum/YAML/BD y de roles/asignaciones YAML/BD, considerando solo filas activas e ignorando IDs y campos de auditoría. Un cambio en tiempo de ejecución incompatible hará fallar un arranque en este modo.
- `FORCE` reconcilia PostgreSQL con YAML. Retira lógicamente las entidades y asignaciones no declaradas, incluidas las membresías activas de usuarios a un rol retirado. Si el rol se declara de nuevo, esas membresías no se restauran automáticamente.
- `OFF` no carga YAML ni realiza la comparación global del enum, pero conserva el checker endpoint → BD y la autorización normal durante cada solicitud.
- Para conservar cambios de roles en tiempo de ejecución se usa `IF_EMPTY` después de la inicialización o `OFF`; `CHECK` exige paridad y `FORCE` vuelve a imponer YAML. El perfil de producción usa `IF_EMPTY` por defecto y permite una sobrescritura del despliegue.

## Consecuencias

**Positivas:**
- Se mantiene la gestión de roles existente mediante API sin renunciar a catálogos versionados ni a un modo estricto de comprobación.
- La inicialización no depende de que las tablas estén vacías, aunque Flyway haya insertado filas bootstrap.
- Retirar las membresías de un rol eliminado evita que la reactivación futura del mismo nombre restaure acceso de forma implícita.

**Negativas:**
- El equipo de despliegue debe elegir el modo según la política de gestión de roles; `CHECK` y `FORCE` no conservan cambios divergentes realizados en tiempo de ejecución.
- Después de inicializarse, `IF_EMPTY` no detecta diferencias entre los roles/asignaciones de YAML y PostgreSQL.
- `OFF` no valida globalmente la configuración de catálogos.
