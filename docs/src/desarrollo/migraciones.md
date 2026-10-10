# Migraciones de base de datos

Flyway versiona y aplica los cambios del esquema PostgreSQL. Al arrancar la API,
Flyway ejecuta las migraciones pendientes y las registra en
`flyway_schema_history`. Hibernate usa `ddl-auto: validate` para comprobar el
esquema sin modificarlo.

## Ubicación y nombre

Guarda los scripts SQL en:

```text
api/src/main/resources/db/migration/
```

## Convención de nombres de Flyway

Una migración SQL versionada sigue esta estructura:

```text
<prefijo><versión>__<descripción>.sql
```

Flyway usa `V` como prefijo predeterminado, dos guiones bajos (`__`) como
separador y `.sql` como extensión. Por ejemplo, `V1__CreateChains.sql`. La
versión debe ser única y Flyway aplica las migraciones versionadas una sola vez,
en orden numérico.

Este repositorio configura `spring.flyway.sql-migration-prefix: v` para mantener
los nombres de archivo en minúsculas. Por eso el ejemplo real es
`v1__crear_tabla_chains.sql`; el prefijo, la versión, el separador y la
descripción ocupan las mismas partes que en el formato predeterminado.

Flyway también admite migraciones repetibles con el formato predeterminado
`R__<descripción>.sql`. No llevan versión y se vuelven a aplicar cuando cambia
su checksum; suelen servir para vistas, funciones o procedimientos. El proyecto
actualmente usa migraciones versionadas. Consulta la documentación de
[migraciones versionadas](https://documentation.red-gate.com/fd/versioned-migrations-273973333.html)
y [migraciones repetibles](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/repeatable-migrations).

Asigna la siguiente versión disponible a cada cambio; no reutilices versiones.

## Flujo de trabajo

1. Acuerda el cambio del esquema y refleja el modelo de datos cuando corresponda.
2. Crea un nuevo script SQL con la siguiente versión disponible.
3. Incluye en él solo el cambio necesario y sus restricciones y valores por
   defecto.
4. Arranca la API contra PostgreSQL. Flyway aplicará el script antes de que
   Hibernate valide el esquema.
5. Revisa los mensajes de arranque y la fila de la migración en
   `flyway_schema_history`.

Una migración que ya se haya aplicado no se edita ni se elimina: Flyway guarda
su checksum en `flyway_schema_history`. Los cambios posteriores se añaden en
otro script versionado.

## Migración de ejemplo

`v1__crear_tabla_chains.sql` crea la tabla `chains` con un identificador,
código único, fechas de creación y actualización y borrado lógico. Sigue la
convención acordada de usar nombres de tabla en plural. El modelo actual de
`model.dbml` aún nombra esta tabla `chain` en singular; queda pendiente alinear
ese modelo con la convención.
