# ADR-0006: PostgreSQL como base de datos principal

## Estado
Accepted

## Contexto
La nota de la reunión del 22 de septiembre establece PostgreSQL como base de datos principal del sistema. Las notas de reuniones posteriores y la configuración del proyecto mantienen PostgreSQL como persistencia de la API.

## Opciones consideradas
1. Usar PostgreSQL como base de datos relacional principal.
2. Usar otra base de datos relacional o no relacional como persistencia principal.

## Decisión
Usar PostgreSQL como base de datos principal para la persistencia del sistema.

## Consecuencias
**Positivas:**
- Proporciona una fuente relacional común para los datos de la aplicación.
- La configuración de desarrollo ya incluye PostgreSQL.

**Negativas:**
- El modelo de datos, las migraciones y el despliegue dependen de PostgreSQL.
