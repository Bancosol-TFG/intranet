# Plan de implementación: catálogo de roles y permisos

## Objetivo

Versionar permisos y el catálogo inicial de roles en YAML, conservar los enums como catálogo del código y gestionar su relación con PostgreSQL según `ROLES_AND_PERMISSION_SYNC`. Los endpoints de gestión de roles siguen permitiendo cambios en tiempo de ejecución. `IF_EMPTY` tolera esos cambios una vez inicializado el catálogo; `CHECK` exige paridad exacta y `FORCE` vuelve a imponer YAML. `OFF` omite la comparación global, pero todos los modos validan los permisos usados por los endpoints contra PostgreSQL.

## Decisiones acordadas

- Modos obligatorios, sin valor predeterminado: `IF_EMPTY`, `FORCE`, `CHECK` y `OFF`.
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

`IF_EMPTY` usa un marcador persistido, creado por Flyway en estado no inicializado; las filas bootstrap como `ADMIN` no cambian ese estado. La primera carga y el cambio del marcador a inicializado son atómicos. Si el marcador ya está inicializado, los cambios de roles/asignaciones realizados mediante API se conservan y no se comparan con YAML; los permisos siguen sujetos a igualdad enum/YAML/BD. La carga inicial no elimina filas no declaradas: las diferencias impiden completar la inicialización y revierten la transacción; la reconciliación destructiva corresponde a `FORCE`.

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

### Fase 2 — Parser y validador estático (paralelizable con Fase 3)

**Agente A: catálogo YAML**

- Crear en `api/src/main/java/es/bancosol/api/roles/service/` el loader y el validador del catálogo.
- Cargar recursos desde el classpath, ordenarlos determinísticamente y conservar archivo/línea/clave de origen.
- Validar sintaxis, claves duplicadas, campos obligatorios, formato, duplicados globales, referencias desconocidas y catálogos vacíos.
- Fallar antes de cualquier escritura en BD si la configuración es inválida.

**Archivos relacionados:** records/DTO de catálogo bajo `roles/dto/` solo si ayudan a separar parseo y dominio.

### Fase 3 — Enum y comprobación de endpoints (paralelizable con Fase 2)

**Agente B: seguridad**

- Conservar `common/security/PermissionCode.java` y crear una comparación por nombres entre el enum y el catálogo YAML.
- Recorrer los handlers HTTP registrados mediante `RequestMappingHandlerMapping`; usar la anotación de permisos y registrar método HTTP, ruta y controlador/método.
- En todos los modos, comprobar que cada permiso requerido por un endpoint existe en BD. En `IF_EMPTY`, `FORCE` y `CHECK`, comprobar además que está en enum y YAML y que ambos catálogos coinciden.
- Cambiar `UserController.create` para usar `USER_CREATE` en `@RequiresPermission`; retirar el string `users:create` de `SecurityConfig`, preservando el control `isReady`.
- Añadir `USER_CREATE` a `PermissionCode` y al archivo YAML correspondiente.
- Actualizar `PermissionAuthorizationManager`, `PermissionAccessTrace` y las pruebas de anotaciones para el nombre normalizado.
- En modos que leen YAML, emitir warning por permisos declarados pero no usados por endpoints. En todos los modos, emitir warning por permisos activos de BD sin ningún rol asignado.
- Emitir log explícito de éxito con conteos por archivo, total de permisos, roles y endpoints comprobados.

**Archivos relacionados:** `common/security/RequiresPermission.java`, `PermissionAuthorizationManager.java`, `PermissionAccessTrace.java`, `common/config/SecurityConfig.java`, `users/controller/UserController.java` y `api/permission-annotation-processor/.../PermissionAnnotationProcessor.java` si sus pruebas o validaciones requieren adaptación.

### Fase 4 — Configuración y perfiles (paralelizable con Fases 2–3)

**Agente C: configuración**

- Definir una propiedad requerida para `ROLES_AND_PERMISSION_SYNC`, sin fallback en YAML ni en perfiles.
- Añadir `application-dev.yaml` y `application-prod.yaml`; el despliegue debe proporcionar `ROLES_AND_PERMISSION_SYNC` explícitamente. Usar `CHECK` cuando se exige paridad; usar `IF_EMPTY` u `OFF` si se permiten cambios de roles en tiempo de ejecución. No introducir un valor predeterminado oculto.
- Actualizar `.env.example` con un modo de desarrollo explícito y `compose.yml` para pasarlo a la API.
- No modificar `.env`; indicar en la documentación que cada desarrollador debe añadir allí el valor requerido.
- Añadir configuración de pruebas explícita, sin relajar el requisito de producción.

**Archivos:** `api/src/main/resources/application.yaml`, `application-dev.yaml`, `application-prod.yaml`, `.env.example`, `compose.yml` y, si procede, `api/src/test/resources/application-test.yaml`.

### Fase 5 — Sincronizador transaccional (secuencial tras Fases 0–4)

**Responsable sugerido:** agente de backend/integrador.

- Reemplazar `roles/service/PermissionCatalogSynchronizer.java` por un sincronizador de permisos, roles y asignaciones.
- Implementar `IF_EMPTY`, `FORCE`, `CHECK` y `OFF` según la tabla de semántica.
- Hacer el trabajo de BD en una sola transacción; usar advisory lock transaccional PostgreSQL para serializar instancias concurrentes.
- En la primera carga de `IF_EMPTY`, poblar el catálogo declarado sin borrar ausentes; validar el resultado y actualizar el marcador en la transacción. En arranques posteriores, tolerar diferencias de roles/asignaciones introducidas en tiempo de ejecución, sin relajar la comparación de permisos.
- En `FORCE`, upsert/reactivar por nombre, reconciliar asignaciones de cada rol, hacer soft delete de ausentes y retirar las membresías `user_roles` de roles eliminados; nunca borrar físicamente.
- En `CHECK`, comparar sin escribir y fallar con diferencias concretas.
- En `OFF`, no cargar recursos YAML ni hacer comparación global enum/YAML/BD.
- En `OFF`, sí ejecutar el checker endpoint → BD y las advertencias que solo requieran consultar BD.
- Invalidar tokens solo si hubo cambios y después del commit mediante `PermissionChangeTracker`.
- Ordenar el runner antes de `AdminBootstrapRunner` y fallar con mensaje claro si hace falta `ADMIN` y no está configurado.

**Archivos relacionados:** `roles/service/`, `roles/repository/RoleRepository.java`, `PermissionRepository.java`, `RolePermissionRepository.java`, entidades necesarias, `auth/service/PermissionChangeTracker.java` y `users/service/AdminBootstrapRunner.java`.

### Fase 6 — Flyway y modelo (secuencial tras Fase 0)

**Responsable sugerido:** agente con foco en BD.

- Crear una migración nueva con prefijo `v` y versión `YYMMDDHHmm`; no editar migraciones existentes.
- Incluir el marcador persistido de inicialización del catálogo, inicialmente no inicializado.
- Normalizar la semilla legacy `users:create` a `USER_CREATE`, preservando la relación de `role_permissions`.
- Añadir la migración de datos que deje sembrados permisos, roles y asignaciones aprobados para entornos que arrancan en `CHECK`.
- Actualizar `model.dbml` si la migración añade una tabla o cambia el esquema.
- Definir la carga inicial de producción: una BD que arranque en `CHECK` debe llegar poblada mediante Flyway. Los despliegues que admitan cambios de roles en tiempo de ejecución deben seleccionar explícitamente `IF_EMPTY` u `OFF`.

### Fase 7 — Pruebas (paralelizable por grupos tras integrar las fases 2–5)

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
- `ROLES_AND_PERMISSION_SYNC` ausente o fuera de `IF_EMPTY|FORCE|CHECK|OFF`.

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
2. **Producción con `CHECK`:** una BD nueva debe llegar poblada mediante Flyway antes del arranque.
3. **Membresías futuras:** al retirar un rol se eliminan lógicamente sus filas `user_roles`. Si se añaden asignaciones de alcance (tienda/colaborador), habrá que definir su retiro dentro de la fase que incorpore esas tablas.

## Orden recomendado de ejecución

`Fase 0 → Fases 1–4 en paralelo con contratos congelados → Fase 5 + Fase 6 → Fase 7 → Fase 8`.

Antes de cada integración, el agente responsable debe indicar archivos tocados, pruebas ejecutadas y cualquier diferencia respecto de este plan. La integración final verifica que no se haya modificado `.env`, `frontend/src/routeTree.gen.ts` ni `volumes/`.
