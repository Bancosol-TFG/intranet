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

El proyecto usa nombres en minúscula y configura Flyway con el prefijo `v`. Cada
migración versionada sigue este formato:

```text
v<versión>__<descripción>.sql
```

Por ejemplo: `v1__crear_tabla_chains.sql`. Usa la siguiente versión disponible
para cada cambio; no reutilices una versión.

## Flujo de trabajo

1. Acuerda el cambio del esquema y refleja el modelo de datos cuando corresponda.
2. Crea un nuevo script SQL con la siguiente versión disponible.
3. Incluye en él solo el cambio necesario y sus restricciones y valores por
   defecto.
4. Arranca la API contra PostgreSQL. Flyway aplicará el script antes de que
   Hibernate valide el esquema.
5. Revisa los mensajes de arranque y la fila de la migración en
   `flyway_schema_history`.

Una migración que ya se haya aplicado no se edita ni se elimina: los cambios
posteriores se añaden en otro script versionado.

## Migración de ejemplo

`v1__crear_tabla_chains.sql` crea la tabla `chains` con un identificador,
código único, fechas de creación y actualización y borrado lógico. Sigue la
convención acordada de usar nombres de tabla en plural. El modelo actual de
`model.dbml` aún nombra esta tabla `chain` en singular; queda pendiente alinear
ese modelo con la convención.
