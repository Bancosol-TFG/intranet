# Plan de implementación: catálogo de roles y permisos

## Objetivo

Versionar permisos y el catálogo inicial de roles en YAML, conservar los enums como catálogo del código y gestionar su relación con PostgreSQL según `ROLES_AND_PERMISSION_SYNC`. Los endpoints de gestión de roles siguen permitiendo cambios en tiempo de ejecución. `IF_EMPTY` tolera esos cambios una vez inicializado el catálogo; `CHECK` exige paridad exacta y `FORCE` vuelve a imponer YAML. `OFF` omite la comparación global, pero todos los modos validan los permisos usados por los endpoints contra PostgreSQL.

## Decisiones acordadas

- Modos válidos de `ROLES_AND_PERMISSION_SYNC`: `IF_EMPTY`, `FORCE`, `CHECK` y `OFF`. Desarrollo requiere el valor explícito; el perfil de producción usa `IF_EMPTY` por defecto y permite sobrescribirlo desde el entorno.
- `CHECK` es el modo de comparación estricta: no modifica la BD y falla si los permisos de los enums, los archivos YAML y la BD no coinciden; también exige igualdad exacta entre roles y asignaciones YAML/BD, considerando solo filas activas e ignorando IDs y campos de auditoría. Es adecuado cuando el despliegue requiere paridad y no admite cambios de roles en tiempo de ejecución.
- `OFF` no carga ni valida YAML ni realiza la comparación global enum ↔ YAML ↔ BD. Se conserva el checker independiente de endpoints contra BD: si una anotación requiere un permiso que no existe en BD, el arranque falla. También puede emitir warnings basados solo en datos de BD.
- `IF_EMPTY` carga el catálogo cuando el marcador persistido indica que no está inicializado. En esa primera carga valida permisos, roles y asignaciones; después valida la igualdad de permisos enum/YAML/BD, pero tolera diferencias de roles y asignaciones YAML/BD introducidas en tiempo de ejecución.
- `FORCE` reconcilia permisos, roles y asignaciones con YAML, reactiva o crea lo declarado y hace soft delete de lo que ya no está declarado.
- Se conservan los mutadores REST existentes para crear roles y cambiar sus permisos. En `IF_EMPTY` tras la carga inicial y en `OFF`, la BD admite esos cambios; `CHECK` falla ante diferencias y `FORCE` las revierte en el siguiente arranque.
- Al retirar por `FORCE` un rol ausente de YAML, también se hace soft delete de sus membresías activas en `user_roles`; si el rol se declara de nuevo, esas membresías no se restauran automáticamente.
- Se conserva `PermissionCode` y se comprueba la igualdad enum ↔ YAML ↔ BD de permisos en `IF_EMPTY`, `FORCE` y `CHECK`. En `IF_EMPTY`, la igualdad de roles/asignaciones solo se comprueba durante la carga inicial.
- Los permisos sin endpoints asociados generan warning. Los permisos sin ningún rol asociado también generan warning.
- Se normaliza el permiso legado `users:create` a `USER_CREATE`.
- Los permisos usan el formato `RECURSO_OPERACIÓN` en mayúsculas; el último segmento identifica la operación y el recurso puede ser compuesto, como `ROLE_PERMISSION`. Las operaciones admitidas son `LIST`, `READ`, `CREATE`, `UPDATE`, `DELETE`, `ASSIGN` y `REVOKE`. `USER_CREATE` reemplaza el permiso legado `users:create`; no se acuerdan otras excepciones.
- No se consulta ni se migra la BD actual: se asume que el entorno de desarrollo se va a resetear. Las migraciones ya aplicadas no se editan; los cambios de BD se hacen con una nueva migración Flyway.

## Semántica de arranque por modo

| Modo | Lee YAML | Compara permisos enum/YAML/BD | Compara roles/asignaciones YAML/BD | Escribe en BD | Endpoint → BD | Comportamiento |
| --- | --- | --- | --- | --- | --- | --- |
| `IF_EMPTY` | Sí | Sí | Solo durante la carga inicial | Solo durante la carga inicial | Sí | Con marcador no inicializado, carga roles, permisos y asignaciones, valida el resultado y marca la inicialización en la misma transacción. Con marcador inicializado, no compara roles/asignaciones para permitir cambios mediante API; sí valida YAML, permisos enum/YAML/BD y endpoints contra BD. |
| `FORCE` | Sí | Sí | Sí | Sí | Sí | Realinea permisos, roles y asignaciones; crea/reactiva lo declarado y hace soft delete de lo ausente, incluidas las membresías de usuarios asociadas a roles retirados. Después verifica el resultado. |
| `CHECK` | Sí | Sí | Sí, igualdad exacta | No | Sí | Exige igualdad entre permisos enum/YAML/BD y entre roles/asignaciones YAML/BD. Falla con diferencias y detalle del elemento afectado. |
| `OFF` | No | No | No | No | Sí | No abre archivos YAML ni hace comparación global del enum. Comprueba en BD que los permisos requeridos por los endpoints existen y conserva la autorización normal en cada solicitud. |

`IF_EMPTY` usa el marcador singleton `role_permission_catalog_state` creado por Flyway con `id = 1` e `initialized = FALSE`; las filas bootstrap como `ADMIN` no cambian ese estado. La primera carga y el cambio del marcador a inicializado son atómicos. Si el marcador ya está inicializado, los cambios de roles/asignaciones realizados mediante API se conservan y no se comparan con YAML; los permisos siguen sujetos a igualdad enum/YAML/BD. La carga inicial no elimina filas no declaradas: las diferencias impiden completar la inicialización y revierten la transacción; la reconciliación destructiva corresponde a `FORCE`.

## Estructura objetivo

```text
api/src/main/resources/
├── application.yaml
├── application-dev.yaml
├── application-prod.yaml
└── security/
    ├── permissions/
    │   ├── stores.yaml
    │   ├── users.yaml
    │   └── ...
    └── roles/
        ├── admin.yaml
        └── ...
```

Ejemplo de `security/permissions/stores.yaml`:

```yaml
permissions:
  - name: STORE_LIST
    description: Consultar el listado de tiendas
  - name: STORE_READ
    description: Consultar una tienda
```

Ejemplo de `security/roles/admin.yaml` (abreviado; el archivo real debe incluir todos los permisos asignados):

```yaml
name: ADMIN
permissions:
  - STORE_LIST
  - STORE_READ
  - USER_CREATE
  - ROLE_LIST
```

La lista de permisos es global entre archivos. Los archivos de rol declaran explícitamente todas sus asignaciones. Los campos de auditoría e identificadores de BD no van en YAML.

Cada archivo de permisos tiene la forma `permissions: [{name, description}]`; cada archivo de rol contiene un único `name` y una lista `permissions` de nombres. Los nombres de permisos son globalmente únicos y cada referencia de rol debe existir en el catálogo. La descripción pertenece al permiso; los roles no incorporan campos de BD ni auditoría.

## Fases y reparto posible entre agentes

Las tareas se pueden repartir entre varios agentes solo en las fases indicadas como paralelizables. Un agente integrador debe revisar los contratos compartidos y ejecutar las pruebas al final. No iniciar tareas dependientes hasta cerrar sus decisiones previas.

### Fase 0 — Contratos y criterios de aceptación (completada)

**Responsable sugerido:** agente integrador / equipo.

- Se acordó el marcador persistido de `IF_EMPTY`, su carga única y la tolerancia posterior a cambios de roles/asignaciones realizados mediante API.
- Se fijó `RECURSO_OPERACIÓN`, las operaciones admitidas y la normalización de `users:create` a `USER_CREATE`.
- Se acordó que `CHECK` exige igualdad exacta de roles y asignaciones además de permisos.
- Se conservan los mutadores de `RoleController` y `RolePermissionService`; los modos para permitir cambios de roles en tiempo de ejecución son `IF_EMPTY` y `OFF`. La decisión queda registrada en [ADR-0022](../../docs/adr/0022-gestion-de-roles-con-catalogo-versionado.md), junto a los ADR-0012 y ADR-0020.
- Se acordó que `OFF` no carga YAML ni compara globalmente el enum, pero conserva el checker endpoint → BD y la autorización normal por solicitud.
- Se acordó hacer soft delete de `user_roles` cuando `FORCE` retire un rol.

**Salida:** contrato de configuración, esquema YAML y criterios de aceptación aprobados, reflejados en esta tabla, la estructura YAML y la matriz siguiente.

### Fase 1 — Catálogos YAML (completada)

**Agente A: permisos**

- Creados seis archivos agrupados por área en `api/src/main/resources/security/permissions/`.
- Incluidos los 55 permisos del enum y el permiso normalizado `USER_CREATE`, con descripciones en español.
- Comprobada la ausencia de permisos omitidos o duplicados.

**Agente B: roles**

- Creados cinco archivos en `api/src/main/resources/security/roles/`: `ADMIN`, `VOLUNTEER`, `STORE-MANAGER`, `COORDINATOR` y `COLLABORATOR-MANAGER`.
- `ADMIN` declara los 56 permisos; los otros cuatro roles declaran una lista de permisos vacía, sin asignaciones inventadas.
- Comprobado que cada referencia existente está en el catálogo de permisos y no se repite.

**Integración completada:** los 56 permisos del catálogo coinciden con el enum más `USER_CREATE`; `ADMIN` incluye todos exactamente una vez y los cinco roles tienen forma de catálogo válida. Los nombres, descripciones y referencias se verificaron automáticamente. No se ejecutaron pruebas de aplicación en esta fase.

### Fase 2 — Parser y validador estático (completada)

**Agente A: catálogo YAML**

- Implementados `RolePermissionCatalogLoader` y `RolePermissionCatalogValidator`, con records de catálogo en `roles/dto/`.
- Cargar recursos desde el classpath en orden determinista y conservar archivo, línea y clave de origen.
- Validar sintaxis, claves YAML duplicadas, campos y tipos obligatorios, formato, duplicados globales, referencias desconocidas y catálogos globales vacíos.
- Usar SnakeYAML en modo seguro y validar todo en memoria, sin integrar todavía un runner ni escribir en BD.
- Añadidas pruebas unitarias de carga válida, orden, origen y errores de validación.

**Verificación:** siete pruebas de `RolePermissionCatalogLoaderTests` aprobadas; `git diff --check` sin errores.

### Fase 3 — Enum y comprobación de endpoints (completada)

**Agente B: seguridad**

- Añadido `USER_CREATE` a `PermissionCode`; `UserController.create` usa `@RequiresPermission(PermissionCode.USER_CREATE)`.
- Retirado el permiso legacy de `SecurityConfig`; `isReady` sigue protegiendo todos los endpoints no públicos.
- `PermissionAuthorizationManager` y `PermissionAccessTrace` siguen trabajando con `PermissionCode`; sus pruebas verifican el permiso normalizado sin lógica especial para el nombre legacy.
- Implementado `RolePermissionCatalogChecker`, que recorre los handlers de `RequestMappingHandlerMapping` y conserva método HTTP, ruta y controlador/método.
- El comprobador expone el control endpoint → BD para todos los modos y la comparación enum↔YAML para los modos que cargan catálogo. No se integra todavía con un runner; se conectará en la Fase 5.
- En modos con catálogo, advierte de permisos YAML sin endpoint; en `OFF`, advierte de permisos activos en BD sin endpoint. Todos los modos advierten de permisos activos sin rol activo.
- Registra resultados con conteos por archivo, permisos, roles y endpoints.
- Actualizadas las pruebas de autorización y `docs/desarrollo/autenticacion.md` para `USER_CREATE`.

**Archivos relacionados:** `common/security/RequiresPermission.java`, `PermissionAuthorizationManager.java`, `PermissionAccessTrace.java`, `common/config/SecurityConfig.java`, `users/controller/UserController.java` y `api/permission-annotation-processor/.../PermissionAnnotationProcessor.java` si sus pruebas o validaciones requieren adaptación.

**Verificación:** 18 pruebas unitarias enfocadas aprobadas (`PermissionAnnotationProcessorTests`, `PermissionSecurityConfigurationTests` y `RolePermissionCatalogCheckerTests`); `git diff --check` sin errores. No se ejecutaron pruebas con PostgreSQL ni `make docs-build`: Docker no estaba iniciado y `make`/`zensical` no están disponibles en el entorno.

### Fase 4 — Configuración y perfiles (completada)

**Agente C: configuración**

- Definida `roles-and-permission-sync` mediante `${ROLES_AND_PERMISSION_SYNC}` en la configuración común y `dev`; producción usa `IF_EMPTY` por defecto en `application-prod.yaml` y permite sobrescribirlo desde el entorno.
- Añadidos `application-dev.yaml` y `application-prod.yaml`; `CHECK` puede configurarse explícitamente cuando se exige paridad, mientras que `IF_EMPTY`/`OFF` permiten cambios de roles en tiempo de ejecución.
- Añadido `ROLES_AND_PERMISSION_SYNC=IF_EMPTY` a `.env.example` y pasado el valor desde Compose con un error claro si falta.
- No se modificó `.env`; `docs/desarrollo/despliegue-local.md` indica que cada desarrollador debe añadir la variable a su propio archivo.
- Añadida configuración de pruebas explícita con `IF_EMPTY` y una prueba que comprueba el valor cargado, independiente del valor predeterminado del perfil de producción.
- Añadidos metadatos de configuración y sugerencias para `IF_EMPTY`, `FORCE`, `CHECK` y `OFF`, con `IF_EMPTY` como valor predeterminado del perfil de producción.

**Archivos:** `api/src/main/resources/application.yaml`, `application-dev.yaml`, `application-prod.yaml`, `META-INF/additional-spring-configuration-metadata.json`, `.env.example`, `compose.yml`, `api/src/test/resources/application.properties`, `api/src/test/java/es/bancosol/api/ApiApplicationTests.java` y `docs/desarrollo/despliegue-local.md`.

**Verificación:** `docker compose config --quiet` pasó con los cuatro valores permitidos; `git diff --check` sin errores. La prueba de contexto no llegó a su aserción porque Flyway encontró `2610301403` aplicada en la BD local pero ausente en el repositorio; no se modificó la BD. No se ejecutó `make docs-build` porque `make`/`zensical` no están disponibles.

### Fase 5 — Sincronizador transaccional (implementada; integración PostgreSQL pendiente de Fase 6)

**Responsable sugerido:** agente de backend/integrador.

- Reemplazado `PermissionCatalogSynchronizer` por un runner transaccional con los cuatro modos y validación explícita de valores.
- Añadido `RolePermissionCatalogRepository` con advisory lock PostgreSQL, marcador singleton y operaciones idempotentes de carga inicial y reconciliación.
- `IF_EMPTY` carga sin borrar ausentes y marca el estado en la misma transacción; en arranques posteriores conserva roles/asignaciones runtime y comprueba la paridad exacta de permisos.
- `FORCE` reconcilia y reactiva por nombre, retira lógicamente filas ausentes y membresías de usuarios a roles retirados; `CHECK` compara sin escrituras persistentes.
- `OFF` no carga YAML ni compara el catálogo global y ejecuta el checker endpoint → BD.
- Ampliado `RolePermissionCatalogChecker` para comparar nombres y descripciones entre `PermissionCode` y YAML. Añadido `RolePermissionCatalogDatabaseChecker` para paridad exacta de nombres/descripciones de permisos y de roles/asignaciones activas con diferencias concretas.
- La invalidación de tokens se registra solo cuando hay cambios y se ejecuta después del commit mediante `PermissionChangeTracker`.
- El runner precede a `AdminBootstrapRunner`; el bootstrap falla con un mensaje claro ante credenciales incompletas o ausencia de un único rol `ADMIN` activo.
- Ajustados los tests de integración al modo `FORCE` y documentado el bootstrap de `ADMIN` en `docs/desarrollo/autenticacion.md`.

**Archivos:** `api/src/main/java/es/bancosol/api/roles/service/PermissionCatalogSynchronizer.java`, `RolePermissionCatalogDatabaseChecker.java`, `api/src/main/java/es/bancosol/api/roles/repository/RolePermissionCatalogRepository.java`, `api/src/main/java/es/bancosol/api/users/service/AdminBootstrapRunner.java`, pruebas de `roles/` y `users/service/`, `docs/desarrollo/autenticacion.md` y este plan.

**Verificación:** 31 pruebas unitarias enfocadas aprobadas (`PermissionCatalogSynchronizerTests`, `RolePermissionCatalogDatabaseCheckerTests`, `AdminBootstrapRunnerTests`, `RolePermissionCatalogLoaderTests` y `RolePermissionCatalogCheckerTests`); compilación de API y `git diff --check` correctos. No se ejecutó `PermissionCatalogIntegrationTests`: faltan `DB_HOST`, `DB_PORT` y `DB_NAME` en el entorno host y la migración del marcador corresponde a la Fase 6.

### Fase 6 — Flyway y modelo (completada)

- Creada `v2611082044__sembrar_catalogo_roles_permisos.sql`, sin editar migraciones previas. Añade el marcador singleton con `id = 1`, la restricción correspondiente y la fila inicial con `initialized = FALSE`.
- Normalizada la semilla activa `users:create` a `USER_CREATE` actualizando la misma fila, por lo que se conserva su relación en `role_permissions`.
- Sembrados los 56 permisos con sus descripciones exactas de YAML, los cinco roles aprobados y las 56 asignaciones de `ADMIN`; los otros roles quedan sin asignaciones.
- Actualizado `model.dbml`. La migración deja el catálogo poblado para `CHECK`; los despliegues que admitan cambios de roles en tiempo de ejecución deben seleccionar `IF_EMPTY` u `OFF`.
- Ajustadas dos pruebas de integración para limpiar el contexto JPA antes de volver a leer cambios aplicados directamente por JDBC.

**Verificación:** PostgreSQL 17 aislado aplicó las 13 migraciones hasta `2611082044`; Hibernate validó el esquema y el arranque en `CHECK` pasó con 56 permisos, cinco roles y paridad exacta. La consulta posterior confirmó `initialized = FALSE`, 56 asignaciones de `ADMIN`, cero asignaciones para los otros roles y ausencia de `users:create`. `PermissionCatalogIntegrationTests`: cinco pruebas aprobadas; `git diff --check` correcto. No se alteró la base local persistente ni `.env`.

### Fase 7 — Pruebas (paralelizable por grupos tras integrar las fases 2–6)

**Agente A: parser/validador** — casos de errores YAML, línea/clave, duplicados, formato y referencias.

**Agente B: sincronización** — modos, idempotencia, soft delete/reactivación, rollback y asignaciones.

**Agente C: seguridad/checker** — endpoints, `USER_CREATE`, faltantes en BD, permisos sin endpoint y permisos sin rol.

**Integrador:** concurrencia PostgreSQL, orden de runners, perfiles, prueba global backend y revisión final.

Actualizar `PermissionCatalogIntegrationTests`, `RoleManagementIntegrationTests`, `PermissionAnnotationProcessorTests`, `PermissionSecurityConfigurationTests`, `ControllerPermissionIntegrationTests` y `WithAllPermissionsSecurityContextFactory` según los cambios.

### Fase 8 — Documentación y cierre

- Crear `docs/desarrollo/roles-permisos.md` con estructura, ejemplos, formato, modos, variables obligatorias y resolución de errores.
- Actualizar `docs/desarrollo/autenticacion.md`, `docs/desarrollo/prototipo-roles-permisos.md`, `docs/desarrollo/migraciones.md` y `docs/index.md`.
- Comprobar documentación con `make docs-build`.
- Ejecutar backend en el entorno Compose indicado por `AGENTS.md` y revisar diferencias de modo `CHECK` antes de preparar el cambio para revisión humana.

## Matriz de pruebas de aceptación

### Deben fallar

- YAML inválido, clave duplicada, permiso duplicado dentro de un archivo o entre archivos.
- Nombre de permiso/rol inválido, rol duplicado, campo obligatorio ausente o referencia de permiso desconocida.
- Diferencia enum ↔ YAML en `IF_EMPTY`, `FORCE` o `CHECK`.
- En la carga inicial de `IF_EMPTY`, diferencias entre roles/asignaciones declarados y el resultado en BD, o filas activas sobrantes que impidan la paridad inicial.
- Permiso utilizado por endpoint ausente en enum/YAML/BD cuando el modo realiza esas comprobaciones; el mensaje debe identificar permiso y endpoint.
- Diferencia de rol o asignaciones entre YAML y BD en `CHECK`.
- Arranque en `CHECK` después de que una operación de API haya cambiado los roles o sus asignaciones respecto de YAML.
- `ROLES_AND_PERMISSION_SYNC` fuera de `IF_EMPTY|FORCE|CHECK|OFF`, o ausente al activar `dev`; el perfil `prod` usa `IF_EMPTY` si no se proporciona una sobrescritura.

### Deben advertir, no fallar

- Permiso de catálogo sin ningún endpoint asociado.
- Permiso de BD sin ningún rol asignado.
- Permiso de YAML sin ningún rol asignado, si la comprobación se define también sobre el catálogo estático.

### Deben pasar

- Arranque desde una BD de desarrollo reiniciada con `IF_EMPTY`.
- Carga inicial `IF_EMPTY` con las filas bootstrap existentes en Flyway, sin inferir inicialización por el conteo de roles.
- Arranques posteriores con `IF_EMPTY` después de crear un rol o cambiar sus permisos por API; las diferencias de roles/asignaciones introducidas en tiempo de ejecución no bloquean el inicio.
- Dos ejecuciones consecutivas sin duplicados ni cambios secundarios.
- `FORCE` crea, actualiza, reactiva y soft-deletea correctamente dentro de una transacción.
- `FORCE` retira también las membresías `user_roles` de roles ausentes; volver a declarar el rol no restaura esas membresías.
- Dos instancias concurrentes terminan con un catálogo consistente.
- `CHECK` con enum, YAML, roles y BD iguales; sin escrituras.
- `OFF` arranca sin abrir ni validar archivos de catálogo.
- `OFF` falla si falta en BD un permiso requerido por un endpoint y advierte de permisos activos sin rol.
- Al fallar una sincronización, no quedan cambios parciales.

## Riesgos y decisiones operativas

1. **Cambios de roles en tiempo de ejecución:** `CHECK` fallará ante diferencias YAML/BD y `FORCE` las sobrescribirá; el despliegue debe seleccionar `IF_EMPTY` u `OFF` si quiere conservarlas. `IF_EMPTY` no detecta divergencias posteriores de roles/asignaciones.
2. **Producción:** el perfil predetermina `IF_EMPTY`; si se requiere paridad estricta, el despliegue debe sobrescribirlo con `CHECK`, y una BD nueva debe llegar poblada mediante Flyway.
3. **Membresías futuras:** al retirar un rol se eliminan lógicamente sus filas `user_roles`. Si se añaden asignaciones de alcance (tienda/colaborador), habrá que definir su retiro dentro de la fase que incorpore esas tablas.

## Orden recomendado de ejecución

`Fase 0 → Fases 1–4 en paralelo con contratos congelados → Fase 5 + Fase 6 → Fase 7 → Fase 8`.

Antes de cada integración, el agente responsable debe indicar archivos tocados, pruebas ejecutadas y cualquier diferencia respecto de este plan. La integración final verifica que no se haya modificado `.env`, `frontend/src/routeTree.gen.ts` ni `volumes/`.
