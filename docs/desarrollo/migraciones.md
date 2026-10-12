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
separador y `.sql` como extensión. La versión debe ser única y Flyway aplica
las migraciones versionadas una sola vez, en orden numérico.

Este repositorio configura `spring.flyway.sql-migration-prefix: v` para mantener
los nombres de archivo en minúsculas. El formato de la versión es
`YYMMDDHHmm`: dos dígitos del año, mes, día, hora (24 horas) y minuto, sin
separadores. Por ejemplo, `2610121530` representa el 12 de octubre de 2026 a
las 15:30; el nombre completo sería
`v2610121530__crear_tabla_chains.sql` (`v` es el prefijo y
`crear_tabla_chains` la descripción).

Se usa una fecha y hora en lugar de una secuencia compartida (`1`, `2`, `3`, …)
para que cada miembro pueda crear migraciones en paralelo sin tener que
coordinar qué número consecutivo le corresponde. Así se reduce el riesgo de que
dos ramas introduzcan archivos SQL con el mismo nombre al integrarse. Como la
precisión llega solo al minuto, dos migraciones creadas en el mismo minuto aún
podrían colisionar: comprueba que la versión no esté ya en uso y, si coincide,
acuerda con el equipo otra marca de minuto distinta. Todo el equipo debe usar el
mismo huso horario.

Flyway también admite migraciones repetibles. Su prefijo predeterminado es `R`,
por ejemplo `R__crear_vista_chains_activas.sql`. Este repositorio configura
`spring.flyway.repeatable-sql-migration-prefix: r` para mantener los nombres en
minúsculas; por eso se usaría `r__crear_vista_chains_activas.sql`. No llevan
versión y se vuelven a aplicar cuando cambia su checksum; suelen servir para
vistas, funciones o procedimientos. Consulta la documentación de
[migraciones versionadas](https://documentation.red-gate.com/fd/versioned-migrations-273973333.html)
y [migraciones repetibles](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/repeatable-migrations).

Aplica el formato `YYMMDDHHmm` a las migraciones nuevas y verifica que la versión
no esté ya en uso; nunca reutilices una versión. No renombres ni edites
migraciones que Flyway ya haya aplicado: Flyway conserva su checksum en
`flyway_schema_history`. Los cambios posteriores se añaden en otro script
versionado.

## Flujo de trabajo

1. Acuerda el cambio del esquema y refleja el modelo de datos cuando corresponda.
2. Crea un nuevo script SQL con el prefijo `v`, la fecha y hora en formato
   `YYMMDDHHmm`, dos guiones bajos, una descripción y la extensión `.sql`.
   Comprueba que no exista ya un script con esa versión.
3. Incluye en él solo el cambio necesario y sus restricciones y valores por
   defecto.
4. Arranca la API contra PostgreSQL. Flyway aplicará el script antes de que
   Hibernate valide el esquema.
5. Revisa los mensajes de arranque y la fila de la migración en
   `flyway_schema_history`.

## Migración inicial existente

`v1__crear_tabla_chains.sql` es la migración inicial que ya existe en el
repositorio y conserva la numeración anterior. La convención con fecha y hora
se aplica a las migraciones nuevas. Este script crea la tabla `chains` con un
identificador, código único, fechas de creación y actualización y borrado
lógico. Sigue la convención acordada de usar nombres de tabla en plural. El
modelo actual de `model.dbml` aún nombra esta tabla `chain` en singular; queda
pendiente alinear ese modelo con la convención.
