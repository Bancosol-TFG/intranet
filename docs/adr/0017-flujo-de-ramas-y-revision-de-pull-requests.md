# ADR-0017: Flujo de ramas y revisión de pull requests

## Estado
Accepted

## Contexto
La nota del 22 de septiembre recoge un flujo con `main` protegida, una rama de desarrollo y ramas de trabajo, además de aprobación de las otras dos personas del equipo para integrar cada pull request. El equipo también acordó usar issues y un tablero de GitHub Projects. La nota del 29 de septiembre completa el flujo: las pull requests se integran mediante merge, conservando los commits individuales (ADR-0015).

## Opciones consideradas
1. Trabajar directamente en la rama principal sin revisión obligatoria.
2. Usar ramas de trabajo, integrar mediante pull request y exigir revisión del resto del equipo.
3. Usar ramas de trabajo con revisión, pero permitir integrar sin aprobación de las otras personas.

## Decisión
Proteger `main`, trabajar mediante una rama de desarrollo y ramas de trabajo, y requerir la aprobación de las otras dos personas del equipo antes de integrar una pull request. Gestionar el trabajo mediante issues y GitHub Projects.

## Consecuencias
**Positivas:**
- Los cambios se revisan antes de integrarse y queda una traza de comentarios y decisiones.
- La rama principal recibe cambios a través de un flujo común del equipo.

**Negativas:**
- La integración depende de que las otras dos personas revisen y aprueben la pull request.
- El equipo debe mantener las ramas y las reglas de protección alineadas con este flujo.
