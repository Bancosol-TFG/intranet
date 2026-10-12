# Nota de reunión — 29 de septiembre de 2026

## Datos de la reunión

- **Fecha:** 2026-09-29
- **Duración:** 55 min
- **Fuente:** `transcript-290926.json`, generado a partir de `2026-09-29 10-37-18.mkv`
- **Participantes:** Miguel, Adrián y Salma

## Resumen

El equipo revisó el avance del esqueleto del backend y la configuración de Docker, y habló de cómo documentar la arquitectura y las decisiones técnicas. También acordó conservar los commits individuales al integrar cambios y trabajar con iteraciones cortas. Como siguiente paso, propuso reunirse presencialmente el 30 de septiembre para concretar la arquitectura, dividir la aplicación en módulos y empezar a definir requisitos y tareas.

## Puntos tratados

- **Backend y base de datos:** Salma está preparando el esqueleto de Spring Boot y la configuración con Docker. Se comentó añadir una dependencia de migraciones de base de datos; el equipo expresó interés en aprender a utilizarla. La configuración y la pull request todavía estaban pendientes.
- **Documentación técnica:** Se explicó el propósito de los diagramas C4 y de los registros de decisiones de arquitectura (ADR). Se consideró útil documentar decisiones técnicas relevantes, con contexto, alternativas, decisión y consecuencias, evitando crear ADR para cambios menores. No se acordó documentar el nivel de código de C4.
- **Flujo de Git:** Se propuso mantener `main`, `dev` y ramas de trabajo. El equipo prefirió integrar mediante merge conservando los commits individuales, en lugar de agruparlos con squash. También se conversó sobre mantener commits pequeños y comprensibles, y usar prefijos como `feat`, `fix` y `docs`; no quedó fijada una convención formal completa para nombres de ramas o commits.
- **Planificación:** Se propuso trabajar con sprints de una semana y revisar el avance en reuniones semanales, trasladando a la siguiente iteración las tareas que no se terminen. La duración de las reuniones podrá variar según el trabajo pendiente.
- **Definición funcional:** Antes de repartir implementación, el equipo quiere revisar la arquitectura, identificar módulos, esbozar requisitos y funciones principales y priorizar un MVP por módulo. Se planteó preparar un documento de funcionalidades para contrastarlo con Bancosol.
- **Próxima sesión:** Se acordó reunirse presencialmente el 30 de septiembre por la mañana, en la universidad, para avanzar en arquitectura y módulos y organizar los primeros requisitos y tareas.

## Decisiones y acuerdos

- Al integrar cambios, se conservarán los commits individuales mediante merge; no se agruparán con squash.
- Se trabajará con iteraciones cortas, con una semana como duración preferida y posibilidad de trasladar tareas pendientes a la siguiente iteración.
- La próxima reunión se celebrará presencialmente el 30 de septiembre por la mañana en la universidad.
- Se preparará documentación de arquitectura y de decisiones técnicas relevantes. Los detalles y el alcance de cada documento se concretarán al trabajar en ellos.

## Tareas y próximos pasos

- **Salma:** terminar de revisar y preparar la configuración de Docker y el esqueleto del backend, y subirlo mediante una pull request para que el equipo pueda revisarlo.
- **Salma:** compartir el material de referencia de C4 y preparar una primera propuesta de diagramas; el equipo podrá revisarla conjuntamente.
- **Miguel:** crear la sección de ADR en la documentación, según lo indicado durante la reunión.
- **Equipo:** reunirse presencialmente el 30 de septiembre para revisar la arquitectura, definir los módulos y empezar a concretar requisitos, MVP y primeras tareas.
- **Equipo:** preparar una propuesta de funcionalidades para compartirla con Bancosol y recoger sus comentarios.

## Puntos por explorar

- Determinar qué herramienta y formato se usarán para elaborar y mantener los diagramas C4.
- Concretar qué decisiones justifican un ADR y cómo se revisarán antes de incorporarlas a la documentación.
- Acordar una convención formal para nombres de ramas y commits.
- Definir el flujo práctico de planificación semanal y la forma de repartir tareas para que todos participen en los distintos módulos.
- Precisar qué dependencia y estrategia de migraciones se utilizarán para la base de datos.
