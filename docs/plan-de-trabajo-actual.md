# Plan de trabajo actual

> Responsabilidades y acuerdos vigentes a partir de la reunión del 12 de octubre de 2026 y de la aclaración posterior de asignaciones. Las actas anteriores conservan el registro de lo acordado en cada fecha.

## Responsabilidades

- **Miguel:** encargarse del trabajo de IA y del frontend.
- **Salma:** preparar los ADR, el despliegue y todas las vistas de la aplicación.
- **Adri:** preparar los diagramas C4, crear las issues generales y preparar el primer sprint.

## Acuerdos de trabajo

- Usar IA como apoyo a la implementación, con revisión humana del código y decisiones de diseño y arquitectura tomadas por el equipo.
- Tomar los sprints de una semana como punto de partida y ajustar su duración según la carga de trabajo.
- Agrupar tareas generales en hitos y dejar que quien asuma cada tarea concrete las sub-issues necesarias.
- Mantener una estructura base por módulo con controladores, servicios, repositorios y entidades; añadir carpetas especializadas cuando sean necesarias.
- Usar entidades en singular y nombres de tablas en plural y minúsculas.
- Mantener un formato común para los ADR, con contexto, opciones, decisión, consecuencias y estado. Las cuestiones no resueltas se registrarán como pendientes, sin presentar una decisión como cerrada.

## Pendiente de concretar

- **Migraciones:** la [guía actual de migraciones](desarrollo/migraciones.md) indica asignar la siguiente versión disponible. En la reunión se aceptó usar versiones basadas en fecha y hora para evitar colisiones al preparar scripts en paralelo, pero quedaron por concretar el formato exacto y cómo resolver el orden de integración de las pull requests. Hay que reconciliar ambos registros antes de cambiar la guía.
- **Flujo de IA:** elegir y documentar el enfoque de trabajo y las skills compartidas; SDD, ODD y otras alternativas se comentaron sin una elección final.
- **Convenciones de código:** cerrar logging, textos como constantes, comentarios, dependencias de validación y uso de consultas derivadas o personalizadas.
- **Vistas y despliegue:** concretar los criterios de diseño y el orden de implementación de las vistas, además del entorno de despliegue previsto.
- **Alcance del producto:** validar con Bancosol qué funcionalidades hacen falta antes de decidir si se amplía el producto o se incorporan ideas como una aplicación móvil o extensiones IoT.

## Referencias

- [Acta de la reunión del 12 de octubre](reuniones/nota-reunion-2026-10-12.md)
- [Migraciones de base de datos](desarrollo/migraciones.md)
