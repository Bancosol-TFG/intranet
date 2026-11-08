# Plan de implementación: catálogo de roles y permisos

## Objetivo

Versionar permisos y roles en YAML, conservar los enums como catálogo del código y mantenerlos sincronizados con PostgreSQL según `ROLES_SYNC_MODE`. El arranque validará la coherencia de los catálogos y de los permisos usados por los endpoints, salvo en el modo `OFF`.

## Decisiones acordadas

- Modos obligatorios, sin valor predeterminado: `IF_EMPTY`, `FORCE`, `CHECK` y `OFF`.
- `CHECK` es el modo de producción: no modifica la BD y falla si los permisos de los enums, los archivos YAML y la BD no coinciden; también valida roles y asignaciones declarados en YAML contra la BD.
- `OFF` no carga ni valida YAML ni realiza la comparación global enum ↔ YAML ↔ BD. Se conserva el checker independiente de endpoints contra BD: si una anotación requiere un permiso que no existe en BD, el arranque falla. También puede emitir warnings basados solo en datos de BD.
- `IF_EMPTY` carga el catálogo solo cuando no está inicializado; `FORCE` lo reconcilia con los archivos y hace soft delete de lo que ya no está declarado.
- Se conserva `PermissionCode` y se comprueba la igualdad enum ↔ YAML ↔ BD en los modos que leen catálogos.
- Los permisos sin endpoints asociados generan warning. Los permisos sin ningún rol asociado también generan warning.
- Se normaliza el permiso legado `users:create` a `USER_CREATE`.
- El formato de permisos sigue el patrón de recurso y operación que se acuerde, por ejemplo `STORE_LIST`, `STORE_READ`, `STORE_CREATE`, `STORE_UPDATE`, `STORE_DELETE`; se permiten formatos especiales si quedan documentados y validados.
- No se consulta ni se migra la BD actual: se asume que el entorno de desarrollo se va a resetear. Las migraciones ya aplicadas no se editan; los cambios de BD se hacen con una nueva migración Flyway.

## Semántica de arranque por modo

| Modo | Lee YAML | Comprueba catálogos enum/YAML/BD | Escribe en BD | Endpoint → BD | Comportamiento |
| --- | --- | --- | --- | --- | --- |
| `IF_EMPTY` | Sí | Sí | Solo en primera inicialización | Sí | Carga roles, permisos y asignaciones desde el catálogo cuando no existe una inicialización previa. Luego valida el resultado. |
| `FORCE` | Sí | Sí | Sí | Sí | Realinea permisos, roles y asignaciones; crea/reactiva lo declarado y hace soft delete de lo ausente. Después verifica el resultado. |
| `CHECK` | Sí | Sí | No | Sí | Exige igualdad entre permisos enum/YAML/BD, y entre roles/asignaciones YAML/BD. Falla con diferencias y detalle del elemento afectado. |
| `OFF` | No | No | No | Sí | No abre archivos de catálogo. Comprueba en BD que los permisos requeridos por los endpoints existen; opera con datos de BD/JWT. |

En `IF_EMPTY`, las migraciones actuales insertan `ADMIN` y permisos de bootstrap, por lo que no basta comprobar `roles.count == 0`. Antes de implementar hay que definir el marcador de catálogo inicializado o una comprobación equivalente. Preferencia: un marcador persistido introducido por una migración Flyway, actualizado en la transacción de carga.

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

## Fases y reparto posible entre agentes

Las tareas se pueden repartir entre varios agentes solo en las fases indicadas como paralelizables. Un agente integrador debe revisar los contratos compartidos y ejecutar las pruebas al final. No iniciar tareas dependientes hasta cerrar sus decisiones previas.

### Fase 0 — Contratos y criterios de aceptación (secuencial)

**Responsable sugerido:** agente integrador / equipo.

- Confirmar semántica exacta de `IF_EMPTY`, especialmente el marcador y las filas bootstrap que crean las migraciones actuales.
- Fijar nombres de permisos y excepciones al patrón `RECURSO_OPERACIÓN`.
- Decidir si `CHECK` exige igualdad exacta de roles y asignaciones, además de permisos.
- Resolver el conflicto entre roles estáticos y los endpoints mutadores existentes (`RoleController`, `RolePermissionService`), teniendo en cuenta `docs/adr/0020-responsabilidad-gestion-roles.md`.
- Acordar el comportamiento de `OFF`: no inspeccionar YAML ni enums; conservar el control de autorización normal en las solicitudes.

**Salida:** contrato de configuración, esquema YAML y lista de criterios de aceptación aprobados.

### Fase 1 — Catálogos estáticos (paralelizable tras Fase 0)

**Agente A: permisos**

- Crear `api/src/main/resources/security/permissions/*.yaml`.
- Trasladar al YAML los nombres y descripciones del enum, agrupados por área.
- Normalizar `users:create` a `USER_CREATE`.
- Comprobar que no se omite ni duplica ningún permiso.

**Agente B: roles**

- Crear `api/src/main/resources/security/roles/*.yaml`, un rol por archivo.
- Incluir `ADMIN` y el conjunto explícito de permisos que debe tener.
- Asegurar que cada referencia existe en el catálogo de permisos.

**Integración:** comparar los dos catálogos y cerrar nombres/campos antes de empezar la sincronización.

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

- Definir una propiedad requerida para `ROLES_SYNC_MODE`, sin fallback en YAML ni en perfiles.
- Añadir `application-dev.yaml` y `application-prod.yaml`; el perfil de producción recibirá `ROLES_SYNC_MODE=CHECK` desde el despliegue, no desde un valor predeterminado oculto.
- Actualizar `.env.example` con un modo de desarrollo explícito y `compose.yml` para pasarlo a la API.
- No modificar `.env`; indicar en la documentación que cada desarrollador debe añadir allí el valor requerido.
- Añadir configuración de pruebas explícita, sin relajar el requisito de producción.

**Archivos:** `api/src/main/resources/application.yaml`, `application-dev.yaml`, `application-prod.yaml`, `.env.example`, `compose.yml` y, si procede, `api/src/test/resources/application-test.yaml`.

### Fase 5 — Sincronizador transaccional (secuencial tras Fases 0–4)

**Responsable sugerido:** agente de backend/integrador.

- Reemplazar `roles/service/PermissionCatalogSynchronizer.java` por un sincronizador de permisos, roles y asignaciones.
- Implementar `IF_EMPTY`, `FORCE`, `CHECK` y `OFF` según la tabla de semántica.
- Hacer el trabajo de BD en una sola transacción; usar advisory lock transaccional PostgreSQL para serializar instancias concurrentes.
- En `FORCE`, upsert/reactivar por nombre, reconciliar asignaciones de cada rol y hacer soft delete de ausentes; nunca borrar físicamente.
- En `CHECK`, comparar sin escribir y fallar con diferencias concretas.
- En `OFF`, no cargar recursos YAML ni validar el catálogo enum contra archivos/BD.
- En `OFF`, sí ejecutar el checker endpoint → BD y las advertencias que solo requieran consultar BD.
- Invalidar tokens solo si hubo cambios y después del commit mediante `PermissionChangeTracker`.
- Ordenar el runner antes de `AdminBootstrapRunner` y fallar con mensaje claro si hace falta `ADMIN` y no está configurado.

**Archivos relacionados:** `roles/service/`, `roles/repository/RoleRepository.java`, `PermissionRepository.java`, `RolePermissionRepository.java`, entidades necesarias, `auth/service/PermissionChangeTracker.java` y `users/service/AdminBootstrapRunner.java`.

### Fase 6 — Flyway y modelo (secuencial tras Fase 0)

**Responsable sugerido:** agente con foco en BD.

- Crear una migración nueva con prefijo `v` y versión `YYMMDDHHmm`; no editar migraciones existentes.
- Incluir el marcador de inicialización de catálogo si se aprueba esa opción.
- Normalizar la semilla legacy `users:create` a `USER_CREATE`, preservando la relación de `role_permissions`.
- Añadir la migración de datos que deje sembrado el catálogo aprobado para entornos de producción que arrancan en `CHECK`.
- Actualizar `model.dbml` si la migración añade una tabla o cambia el esquema.
- Definir la carga inicial de producción: la aplicación usará `CHECK`, por lo que una BD nueva debe llegar previamente poblada mediante Flyway.

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
- Permiso utilizado por endpoint ausente en enum/YAML/BD cuando el modo realiza esas comprobaciones; el mensaje debe identificar permiso y endpoint.
- Diferencia de rol o asignaciones entre YAML y BD en `CHECK`.
- `ROLES_SYNC_MODE` ausente o fuera de `IF_EMPTY|FORCE|CHECK|OFF`.

### Deben advertir, no fallar

- Permiso de catálogo sin ningún endpoint asociado.
- Permiso de BD sin ningún rol asignado.
- Permiso de YAML sin ningún rol asignado, si la comprobación se define también sobre el catálogo estático.

### Deben pasar

- Arranque desde una BD de desarrollo reiniciada con `IF_EMPTY`.
- Dos ejecuciones consecutivas sin duplicados ni cambios secundarios.
- `FORCE` crea, actualiza, reactiva y soft-deletea correctamente dentro de una transacción.
- Dos instancias concurrentes terminan con un catálogo consistente.
- `CHECK` con enum, YAML, roles y BD iguales; sin escrituras.
- `OFF` arranca sin abrir ni validar archivos de catálogo.
- `OFF` falla si falta en BD un permiso requerido por un endpoint y advierte de permisos activos sin rol.
- Al fallar una sincronización, no quedan cambios parciales.

## Riesgos y puntos pendientes

1. **Roles gestionados también por endpoints:** la API actual permite crear roles y cambiar asignaciones. `FORCE` puede retirar esos cambios y `CHECK` los marcará como diferencia. Decidir antes de implementar si se mantienen, se limitan o los archivos pasan a ser la única fuente autorizada. Revisar ADR-0020.
2. **Semántica exacta de `IF_EMPTY`:** las migraciones preinsertan `ADMIN`; necesita marcador o tratamiento explícito de bootstrap legado.
3. **Comportamiento de `OFF`:** este plan asume que no lee YAML ni hace comparación global de catálogos, pero conserva el checker endpoint → BD y las advertencias consultables solo desde BD.
4. **Nombres especiales:** validar si `USER_CREATE` sigue el formato final acordado para permisos de usuario.
5. **Soft delete de membresías:** confirmar si al retirar un rol del YAML se hacen soft delete sus asignaciones de usuarios y cómo se tratan las tablas de alcance (tienda/colaborador) cuando estén implementadas.
6. **Producción:** `CHECK` no puede inicializar una BD vacía; la migración de datos Flyway debe preceder al arranque.

## Orden recomendado de ejecución

`Fase 0 → Fases 1–4 en paralelo con contratos congelados → Fase 5 + Fase 6 → Fase 7 → Fase 8`.

Antes de cada integración, el agente responsable debe indicar archivos tocados, pruebas ejecutadas y cualquier diferencia respecto de este plan. La integración final verifica que no se haya modificado `.env`, `frontend/src/routeTree.gen.ts` ni `volumes/`.
