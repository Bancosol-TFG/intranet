# Nota de reunión — 12 de octubre de 2026

## Datos de la reunión

- **Fecha:** 2026-10-12
- **Duración:** 0 h 53 min
- **Fuente:** `reunion-tfg-2026-10-12-part1.json` y `reunion-tfg-2026-10-12-part2.json`, transcripciones de `reunion-tfg-2026-10-12-part1.mkv` y `reunion-tfg-2026-10-12-part2.mkv`.
- **Participantes:** Adrián, Miguel y Salma.

## Resumen

La reunión se centró en el uso de Flyway para versionar los cambios de la base de datos, la estructura y las convenciones iniciales del backend, y la forma de incorporar IA al desarrollo con revisión humana. El equipo propuso avanzar primero con los CRUD básicos y la documentación de arquitectura, mientras prepara un flujo de trabajo asistido por IA y el esqueleto del frontend. Quedaron abiertos el orden de aplicación de migraciones cuando se integren cambios concurrentes, varias convenciones técnicas y el alcance final de la aplicación.

## Puntos tratados

- **Migraciones y persistencia:** Se explicó la diferencia entre los scripts SQL versionados de Flyway y la validación que Hibernate realiza entre las entidades y las tablas. Para las migraciones iniciales se planteó que cada persona prepare sus scripts y use una versión basada en fecha y hora para evitar colisiones de nombres. También se señaló que el orden en que se integren las pull requests puede no coincidir con el orden temporal de los scripts y que los cambios incompatibles requerirán una estrategia adicional.
- **Estructura del backend:** Se comentó una estructura base por módulo con controladores, servicios, repositorios y entidades, creando carpetas adicionales —por ejemplo, para excepciones o seguridad— solo cuando sean necesarias. También se propuso mantener las entidades en singular y los nombres de tablas en plural y minúsculas. Se comentaron las consultas derivadas de Spring Data y las consultas personalizadas para casos más complejos, sin fijar una regla exhaustiva.
- **Convenciones de implementación:** Se planteó centralizar como constantes los textos usados en logs y utilizar una abstracción de logging, además de revisar dependencias de validación y el formato de nombres de migración. Son propuestas técnicas comentadas, no todas quedaron como convenciones definitivas.
- **Desarrollo asistido por IA:** El equipo expresó que quiere usar IA para acelerar tareas de implementación, manteniendo la revisión del código y las decisiones de diseño y arquitectura bajo responsabilidad humana. Se habló de documentar convenciones y contexto del proyecto y de preparar skills reutilizables para mantener coherencia. No se eligió todavía entre SDD, ODD u otro flujo concreto; se planteó probarlo y ajustarlo durante el proyecto.
- **Backend, frontend y diseño de vistas:** Se propuso priorizar ahora los CRUD básicos del backend y comprobarlos con Postman. Antes de ampliar el trabajo de interfaz, se quiere preparar un esqueleto de frontend integrado en Docker Compose y con recarga en desarrollo. El diseño y la distribución de las vistas quedaron para concretarlos después, con la posibilidad de partir de los bocetos existentes.
- **Planificación y seguimiento:** Se consideraron sprints semanales como punto de partida, con flexibilidad para alargarlos si la carga académica lo requiere. Para los hitos se propuso crear tareas generales y que cada responsable concrete sus propias subtareas, en vez de dividir por adelantado todo el trabajo de cada persona.
- **Documentación y alcance del TFG:** Se habló de preparar diagramas C4 y ADR con un formato común que incluya contexto, opciones, decisión, consecuencias y estado. Las cuestiones aún abiertas podrían registrarse como pendientes, sin presentar una decisión como cerrada. También se mencionó revisar el alcance con Bancosol y valorar más adelante si hace falta ampliar funcionalidades; las ideas sobre la aplicación móvil o posibles extensiones IoT fueron exploratorias.

## Decisiones y acuerdos

- Para las migraciones iniciales, cada persona preparará sus scripts SQL de Flyway y usará una versión basada en fecha y hora para reducir colisiones de nombres.
- Se seguirá una estructura base de módulo con controladores, servicios, repositorios y entidades; las carpetas especializadas se añadirán cuando hagan falta, no por adelantado vacías.
- Se propuso mantener entidades en singular y tablas en plural y minúsculas.
- La IA se usará como apoyo a la implementación, con revisión humana del código y decisiones de diseño y arquitectura tomadas por el equipo.
- Se trabajará inicialmente con sprints semanales, revisando su duración según la carga de trabajo.
- Se mantendrá una estructura homogénea para los ADR —contexto, opciones, decisión, consecuencias y estado— y las cuestiones aún abiertas se marcarán como pendientes, sin conclusión.

## Tareas y próximos pasos

- **Miguel:** encargarse del trabajo de IA y del frontend.
- **Salma:** preparar los ADR, el despliegue y todas las vistas de la aplicación.
- **Adri:** preparar los diagramas C4, crear las issues generales y preparar el primer sprint.
- **Equipo:** continuar los CRUD básicos, revisar las pull requests y dejar integrada la estructura inicial del backend.
- **Equipo:** contrastar con Bancosol las necesidades y el alcance antes de decidir si se incorporan funcionalidades adicionales.

## Puntos por explorar

- Definir cómo gestionar las migraciones cuando las pull requests se integren en un orden distinto al de sus versiones, especialmente si modifican o eliminan estructuras compartidas.
- Concretar el formato exacto de los nombres y versiones de Flyway, incluidos los casos de dos scripts creados en el mismo intervalo.
- Cerrar las convenciones de código aún comentadas: consultas derivadas frente a personalizadas, logging y constantes de texto, dependencias de validación, comentarios y formato de commits.
- Elegir y documentar el flujo de trabajo con IA y las skills compartidas, a partir de pruebas durante el proyecto.
- Definir las vistas del frontend, cómo se repartirán y cuándo se implementarán respecto al backend.
- Validar con Bancosol el alcance del producto y decidir si la aplicación móvil u otras extensiones son necesarias para el TFG; las ideas mencionadas no se acordaron como funcionalidades.
