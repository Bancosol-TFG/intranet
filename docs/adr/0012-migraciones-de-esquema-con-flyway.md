# ADR-0012: Migraciones de esquema con Flyway

## Estado
Accepted

## Contexto
Flyway versiona y aplica los cambios del esquema PostgreSQL; Hibernate valida el esquema sin modificarlo (`ddl-auto: validate`). La convención para identificar nuevas migraciones y la excepción de la migración inicial se documentan por separado en el ADR-0022. La reunión del 12 de octubre también identificó que el orden de integración de las pull requests puede diferir del orden de las migraciones y que los cambios incompatibles requieren una estrategia adicional.

## Opciones consideradas
1. Gestionar los cambios del esquema mediante migraciones SQL versionadas con Flyway y validar las entidades con Hibernate.
2. Dejar que el ORM actualice automáticamente el esquema a partir de las entidades.
3. Aplicar cambios manuales sin un mecanismo de versionado común.

## Decisión
Usar Flyway para versionar y aplicar migraciones SQL del esquema PostgreSQL. Hibernate valida que las entidades correspondan con ese esquema, sin actualizarlo. La migración inicial existente permanece como parte del historial de Flyway.

## Consecuencias
**Positivas:**
- El esquema puede evolucionar mediante cambios versionados y revisables.
- El equipo comparte un historial de migraciones y puede detectar conflictos de versión.

**Negativas:**
- Los cambios de esquema requieren crear y coordinar migraciones.
- El orden de integración puede no corresponder al orden de aplicación de las migraciones; los cambios incompatibles requieren coordinación adicional.
