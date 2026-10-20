# ADR-0017: Versiones de migraciones Flyway

## Estado
Accepted

## Contexto
El equipo eligió Flyway para versionar el esquema (ADR-0011). La secuencia numérica compartida podía producir colisiones cuando varias personas preparasen migraciones en paralelo. La documentación del proyecto define para las migraciones nuevas una versión con fecha y hora `YYMMDDHHmm`, comprobando que no se reutilice y usando el mismo huso horario. La migración inicial `v1__crear_tabla_chains.sql` es una excepción heredada.

## Opciones consideradas
1. Asignar versiones secuenciales coordinadas por el equipo.
2. Usar una marca de fecha y hora para cada migración.
3. Permitir que cada persona elija versiones sin una convención común.

## Decisión
Usar `YYMMDDHHmm` para las nuevas migraciones versionadas, verificar que la versión no esté ya usada y mantener un mismo huso horario en el equipo. No renombrar ni editar migraciones que Flyway ya haya aplicado. La migración inicial `v1` conserva su versión anterior.

## Consecuencias
**Positivas:**
- Reduce la necesidad de coordinar números consecutivos entre ramas.
- Mantiene cada migración aplicada como parte de un historial inmutable y revisable.

**Negativas:**
- Dos migraciones creadas en el mismo minuto pueden colisionar y requieren elegir otra marca temporal.
- El orden temporal de versión puede diferir del orden de integración de las pull requests.
