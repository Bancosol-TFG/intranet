# ADR-0010: Uso de Kafka para procesamiento asíncrono

## Estado
Accepted

## Contexto
Se debatió usar Kafka para desacoplar notificaciones, auditoría, estadísticas y otras acciones disparadas por eventos. En la documentación de la reunión del 22 de septiembre se concluye que no se considera necesario para arrancar; en reuniones posteriores no se recoge un cambio de esa decisión.

## Opciones consideradas
1. Incorporar Kafka desde el inicio para distribuir eventos entre consumidores.
2. Empezar sin Kafka y ejecutar las operaciones necesarias directamente.
3. Aplazar Kafka hasta que haya necesidades de carga, desacoplamiento o procesamiento asíncrono que lo justifiquen.

## Decisión
No incorporar Kafka en la arquitectura inicial. Revisar esta decisión si aparecen necesidades concretas de procesamiento asíncrono, desacoplamiento o carga que justifiquen la infraestructura adicional.

## Consecuencias
**Positivas:**
- Aplazarlo reduce infraestructura y complejidad inicial.
- La decisión puede revisarse cuando se definan los flujos de notificación y auditoría.

**Negativas:**
- Si aparecen tareas lentas o desacopladas, habrá que diseñar cómo procesarlas sin un bus de eventos.
