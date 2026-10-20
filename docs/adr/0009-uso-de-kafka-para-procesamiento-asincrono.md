# ADR-0009: Uso de Kafka para procesamiento asíncrono

## Estado
Proposed

## Contexto
Se debatió usar Kafka para desacoplar notificaciones, auditoría, estadísticas y otras acciones disparadas por eventos. La documentación de la reunión del 22 de septiembre indica que no se considera necesario para arrancar, pero deja abierta la evaluación de su utilidad.

## Opciones consideradas
1. Incorporar Kafka desde el inicio para distribuir eventos entre consumidores.
2. Empezar sin Kafka y ejecutar las operaciones necesarias directamente.
3. Aplazar Kafka hasta que haya necesidades de carga, desacoplamiento o procesamiento asíncrono que lo justifiquen.

## Decisión
Pendiente de decisión. Kafka no se considera necesario para arrancar, pero el equipo decidirá más adelante si lo incorpora cuando concrete las necesidades de procesamiento asíncrono, desacoplamiento y carga.

## Consecuencias
**Positivas:**
- Aplazarlo reduce infraestructura y complejidad inicial.
- La decisión puede revisarse cuando se definan los flujos de notificación y auditoría.

**Negativas:**
- Si aparecen tareas lentas o desacopladas, habrá que diseñar cómo procesarlas sin un bus de eventos.
