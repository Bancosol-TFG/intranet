# ADR-0012: Separación de roles y permisos

## Estado
Accepted

## Contexto
La reunión del 22 de septiembre acordó mantener roles y permisos como conceptos separados para poder configurar sus combinaciones. Las notas indican que la coherencia entre roles y permisos debe validarse en la lógica de la aplicación. El modelo actual incluye las relaciones `user_role` y `role_permission`.

## Opciones consideradas
1. Mantener entidades separadas para roles y permisos y asignar permisos a roles.
2. Codificar permisos directamente en cada rol o en el código de cada endpoint.

## Decisión
Mantener separados roles y permisos, asignando permisos a roles y roles a usuarios. La aplicación deberá comprobar que las combinaciones asignadas sean coherentes.

## Consecuencias
**Positivas:**
- Los permisos pueden componerse y reutilizarse en distintos roles.
- La asignación puede gestionarse sin codificar cada combinación en los endpoints.

**Negativas:**
- La autorización requiere consultar y validar relaciones entre usuarios, roles y permisos.
- Queda por definir qué combinaciones son válidas y cómo se limita cada permiso a campañas o recursos.
