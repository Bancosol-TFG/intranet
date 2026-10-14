# ADR-0014: Indicador de participación de tienda por campaña

## Estado
Accepted

## Contexto
La nota del 27 de agosto registra que las participaciones de tiendas se conservan asociadas a campañas y que se acordó un indicador booleano en `store_participation`. El indicador permite distinguir si una tienda participa en una campaña sin eliminar el registro de participación.

## Opciones consideradas
1. Mantener un registro por tienda y campaña con un booleano `participates`.
2. Eliminar el registro de participación cuando la tienda deja de participar.
3. Representar la participación mediante listas o tablas separadas por estado.

## Decisión
Mantener una fila por tienda y campaña y utilizar el booleano `participates` para indicar si participa. El registro conserva el contexto de la campaña aunque la participación se desactive.

## Consecuencias
**Positivas:**
- Se conserva el historial de participación por campaña.
- Las consultas pueden filtrar por el estado de participación sin comparar varias tablas.

**Negativas:**
- Las consultas operativas deben filtrar explícitamente las filas con `participates = true`.
- Debe definirse cómo afecta cambiar el estado a turnos o asignaciones ya existentes.
