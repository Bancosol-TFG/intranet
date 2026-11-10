# Catálogo de roles y permisos

Esta guía explica cómo mantener el catálogo YAML y cómo elegir el modo de sincronización al arrancar la API. La autenticación y la creación de la cuenta del primer administrador se describen en [Autenticación](autenticacion.md).

## Archivos YAML

El catálogo está en `api/src/main/resources/security/` y se carga de forma global desde todos los archivos `.yaml` de sus dos carpetas:

```text
security/
├── permissions/
│   ├── stores.yaml
│   ├── users.yaml
│   └── ...
└── roles/
    ├── admin.yaml
    └── ...
```

Cada permiso declara un nombre y una descripción en español. Los nombres son globalmente únicos, aunque estén repartidos entre archivos:

```yaml
permissions:
  - name: STORE_LIST
    description: Consultar el listado de tiendas
  - name: STORE_READ
    description: Consultar una tienda
```

Cada archivo de rol declara un único rol y todas sus asignaciones. No incluyas IDs ni campos de auditoría:

```yaml
name: ADMIN
permissions:
  - STORE_LIST
  - STORE_READ
  - USER_CREATE
```

Los ejemplos son fragmentos; el catálogo real debe incluir todos los permisos y roles que se deseen declarar. Usa `permissions: []` para un rol sin asignaciones. Cada nombre de permiso puede aparecer una sola vez en una lista de rol y debe existir en el catálogo global. No añadas campos distintos de los mostrados.

Los permisos siguen el formato `RECURSO_OPERACIÓN`, en mayúsculas. El recurso puede tener varios segmentos, como `ROLE_PERMISSION`; la operación final debe ser `LIST`, `READ`, `CREATE`, `UPDATE`, `DELETE`, `ASSIGN` o `REVOKE`. El antiguo `users:create` se normalizó a `USER_CREATE`; no vuelvas a usar el nombre legado.

## Relación entre código, YAML y PostgreSQL

`PermissionCode` es el catálogo de permisos que usa el código, por ejemplo en `@RequiresPermission`. Los YAML versionan los permisos y describen los roles y sus asignaciones. PostgreSQL mantiene los permisos, roles y relaciones activas que usa la autorización en ejecución.

En los modos que cargan catálogo, los permisos deben coincidir exactamente en los tres sitios:

- `PermissionCode` y YAML: mismos nombres y descripciones.
- YAML y PostgreSQL: mismos nombres y descripciones de permisos activos.
- En los modos que comparan roles, YAML y PostgreSQL deben tener los mismos roles y asignaciones activas.

Una asignación de YAML referencia el nombre del permiso; PostgreSQL materializa esa relación en `role_permissions`. Las comparaciones ignoran IDs y campos de auditoría. Añade o cambia un permiso en el código y el YAML en el mismo cambio; el modo elegido determinará cómo se actualiza o verifica la base de datos.

La migración `v2611082044__sembrar_catalogo_roles_permisos.sql` **no inserta roles, permisos ni asignaciones**. Solo crea el marcador `role_permission_catalog_state` con `id = 1` e `initialized = FALSE`, y normaliza la fila activa `users:create` a `USER_CREATE` (conservando sus relaciones). Por tanto, en una base nueva las tablas no se consideran inicializadas por el número de filas: la primera carga depende del runner de sincronización y de los YAML.

## Elegir el modo de sincronización

Configura `ROLES_AND_PERMISSION_SYNC` con uno de estos valores exactos:

| Modo | Comportamiento de arranque | Cuándo usarlo |
| --- | --- | --- |
| `IF_EMPTY` | Lee y valida YAML. Si el marcador está en `FALSE`, crea o reactiva los permisos, roles y asignaciones declarados, comprueba el resultado y marca el catálogo como inicializado en la misma transacción. No elimina filas activas que no estén en YAML: si impiden la igualdad, la carga falla y se revierte. En arranques posteriores exige paridad de permisos, pero tolera cambios de roles y asignaciones hechos mediante API. | Desarrollo y despliegues que permiten gestionar roles en tiempo de ejecución. Es el valor predeterminado de producción. |
| `FORCE` | Lee YAML y reconcilia PostgreSQL con él: crea o actualiza y reactiva lo declarado, y retira lógicamente lo ausente. También retira las membresías activas de usuarios a roles retirados; si el rol se declara de nuevo, esas membresías no se restauran. Después verifica la paridad. | Cuando se quiere volver a imponer intencionalmente el catálogo versionado. Revisa el impacto antes de usarlo. |
| `CHECK` | Lee YAML, no escribe en PostgreSQL y exige igualdad exacta de permisos (incluidas descripciones), roles y asignaciones activas. | Despliegues que requieren paridad estricta y no admiten divergencias de roles en tiempo de ejecución. |
| `OFF` | No carga ni valida YAML ni compara globalmente `PermissionCode` con YAML o PostgreSQL. Sí comprueba que cada permiso requerido por un endpoint exista activo en PostgreSQL. La autorización de cada solicitud sigue aplicándose. | Cuando se gestionan roles en tiempo de ejecución y se decide omitir la comparación global del catálogo. |

`IF_EMPTY` usa el marcador persistente, no una tabla vacía ni la existencia de un rol `ADMIN`, para decidir si debe hacer la carga inicial. La carga y el cambio del marcador a `TRUE` son atómicos. Una vez inicializado, este modo conserva los cambios runtime de roles y asignaciones, pero no las diferencias de permisos.

## Configuración por perfil

La propiedad `roles-and-permission-sync` recibe el valor de la variable de entorno `ROLES_AND_PERMISSION_SYNC`:

| Perfil | Valor predeterminado | Operación |
| --- | --- | --- |
| `dev` | No tiene valor predeterminado; la variable es obligatoria. | Define `ROLES_AND_PERMISSION_SYNC` en el entorno de desarrollo. La plantilla `.env.example` propone `IF_EMPTY`; si ya tienes un `.env`, añade la variable manualmente. |
| `prod` | `IF_EMPTY`. | Puedes sobrescribir el valor desde el entorno de despliegue, por ejemplo con `CHECK` si necesitas paridad estricta. |

Los únicos valores admitidos son `IF_EMPTY`, `FORCE`, `CHECK` y `OFF`. Usa `IF_EMPTY` u `OFF` si necesitas conservar cambios de roles hechos mediante API; `CHECK` fallará ante diferencias y `FORCE` las revertirá según YAML.

## Sincronización del catálogo y cuenta `ADMIN`

Son dos tareas independientes que se ejecutan en orden:

1. El runner de catálogo procesa permisos, roles y asignaciones según `ROLES_AND_PERMISSION_SYNC`. En la primera carga de `IF_EMPTY`, los YAML proporcionan esos datos; la migración citada solo crea el marcador y normaliza `USER_CREATE`.
2. Después, `AdminBootstrapRunner` puede crear una cuenta de usuario con el rol `ADMIN`, si se configuran juntas `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Falla si falta una de las dos o no existe exactamente un rol `ADMIN` activo. Si el correo ya existe, no crea otra cuenta.

El bootstrap de la cuenta no crea ni sincroniza el rol, sus permisos ni sus asignaciones. Asegúrate de que el catálogo haya creado el rol antes de habilitar las credenciales de bootstrap. Consulta [Autenticación: primer administrador](autenticacion.md#primer-administrador) para más detalles sobre la cuenta.

## Errores y advertencias

| Mensaje o síntoma | Qué revisar |
| --- | --- |
| Valor de `roles-and-permission-sync` no válido o propiedad ausente | Configura una de las cuatro opciones válidas. En `dev` define la variable; en `prod`, confirma que una sobrescritura del entorno sea intencional. |
| YAML inválido, campos ausentes/desconocidos, clave o nombre duplicado, catálogo vacío, nombre con formato incorrecto o referencia desconocida | Lee el archivo, línea y clave indicados por el error. Corrige la sintaxis; usa solo los campos documentados; evita duplicados entre todos los archivos de permisos o roles, y asegúrate de que cada asignación exista en el catálogo global. |
| `PermissionCode` no coincide con YAML | Comprueba permisos faltantes o sobrantes y descripciones. Alinea enum y YAML; esta comprobación se ejecuta en `IF_EMPTY`, `FORCE` y `CHECK`, no en `OFF`. |
| Permisos YAML y PostgreSQL no coinciden | Compara nombres y descripciones de permisos activos. En un `IF_EMPTY` todavía no inicializado, revisa también cualquier fila activa existente: los sobrantes impiden completar la carga inicial y la transacción se revierte. En `CHECK`, corrige la divergencia sin que el modo escriba; usa `FORCE` solo si quieres imponer YAML. |
| Roles o asignaciones YAML y PostgreSQL no coinciden | Ocurre en la carga inicial de `IF_EMPTY` y en cada arranque `CHECK`. Revisa los roles y las parejas rol-permiso indicadas. Tras inicializarse, `IF_EMPTY` tolera esas diferencias runtime; `FORCE` las reconcilia con YAML. |
| Un endpoint requiere un permiso ausente o inactivo en PostgreSQL | Crea/reactiva el permiso mediante la sincronización correcta y comprueba que el endpoint use el `PermissionCode` correspondiente. El chequeo endpoint → BD funciona también en `OFF` y el error identifica permiso y endpoint. |
| Falta el marcador `role_permission_catalog_state` con `id = 1` | Aplica las migraciones Flyway antes de iniciar la API. No crees el marcador manualmente. |
| Faltan `ADMIN_EMAIL`/`ADMIN_PASSWORD` o no hay exactamente un rol activo `ADMIN` | Si deseas crear la cuenta, define ambas credenciales y confirma que el catálogo ya ha creado un único `ADMIN` activo. Para desactivar el bootstrap, deja ambas vacías. |

Las siguientes situaciones generan advertencias, no detienen el arranque:

- Un permiso YAML sin endpoint asociado (en `OFF` se informa de permisos activos en PostgreSQL sin endpoint, porque no se lee YAML).
- Un permiso activo en PostgreSQL que no esté asignado a ningún rol activo.

Investiga si son permisos sin uso o asignaciones incompletas. En `OFF`, el chequeo de endpoints y las advertencias de base de datos siguen activos aunque la comparación global del catálogo esté desactivada.
