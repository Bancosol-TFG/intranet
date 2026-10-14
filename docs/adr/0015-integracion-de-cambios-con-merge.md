# ADR-0015: Integración de cambios conservando los commits

## Estado
Accepted

## Contexto
La nota de la reunión del 29 de septiembre recoge que las pull requests se integrarán mediante merge conservando los commits individuales, en lugar de agruparlos con squash. También se acordó mantener commits pequeños y comprensibles.

## Opciones consideradas
1. Integrar mediante merge y conservar los commits de la rama.
2. Usar squash merge para convertir cada pull request en un único commit.
3. Rebasar y reescribir la historia antes de integrar.

## Decisión
Integrar las pull requests mediante merge conservando sus commits individuales; no usar squash para agruparlos.

## Consecuencias
**Positivas:**
- Se conserva la secuencia de cambios y el trabajo registrado en cada rama.
- La historia permite revisar los commits que componen una pull request.

**Negativas:**
- La historia de `dev` tendrá más commits y merges.
- El equipo debe mantener commits comprensibles y evitar incorporar cambios temporales innecesarios.
