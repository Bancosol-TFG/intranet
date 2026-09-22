# Nota de reunión — 22 de septiembre de 2026

## Datos de la reunión

- **Fecha:** 2026-09-22
- **Duración:** 2 h 10 min
- **Fuente:** `transcript.json`, generado a partir de `2026-09-22 10-41-36.mkv`
- **Participantes:** Miguel, Adrián y Salma

## Resumen

El equipo revisó el modelo de datos y fijó una primera arquitectura para comenzar el desarrollo. Se acordó centralizar en GitHub la planificación, las issues y el flujo de ramas y pull requests, con una estructura común para las tareas y revisiones obligatorias del equipo. También se acordó trasladar a Zensical la documentación existente en Notion. Como primer paso de implementación, Salma preparará la estructura inicial del proyecto para que el equipo pueda revisarla y, a partir de ella, dividir el trabajo en módulos y requisitos.

## Puntos tratados

- Revisión del modelo de permisos. Se mantendrá la separación entre roles y permisos para poder configurarlos de forma dinámica; la coherencia de las combinaciones de roles deberá controlarse en la lógica de la aplicación.
- Diseño inicial de una arquitectura cliente-servidor. Se plantearon dos clientes en React —la intranet web y una aplicación web progresiva para móvil— comunicados mediante una API REST en JSON con un backend Spring Boot organizado por capas.
- Persistencia y servicios de apoyo. PostgreSQL será la base de datos principal y Redis se empleará como caché para datos consultados con frecuencia, como los roles y permisos.
- Estrategia de logs. Se discutió separar los logs técnicos de las acciones de negocio y valorar rotación de archivos, persistencia temporal y herramientas como Grafana y Loki. La solución concreta quedó sin cerrar.
- Convenciones iniciales. Los endpoints REST y las tablas usarán nombres en plural; las variables seguirán `camelCase` y las constantes, mayúsculas con guiones bajos.
- Flujo de trabajo. El equipo usará GitHub para alojar el código y organizar el trabajo mediante issues, un tablero Kanban, una rama de desarrollo y pull requests. Las issues seguirán una plantilla común y la rama principal estará protegida; cada pull request deberá recibir la aprobación de los otros dos integrantes antes de integrarse.
- Documentación. Se migrará a `intranet/docs` la documentación mantenida hasta ahora en Notion. En Zensical se guardarán también notas fechadas de las reuniones y se documentarán las decisiones y cambios técnicos, problemas relevantes, instrucciones de uso y despliegue. La documentación se consultará antes de plantear dudas ya resueltas.
- Organización del desarrollo. Se debatió trabajar en iteraciones cortas, repartir tareas de tamaño semejante y mantener al menos una reunión semanal, sin cerrar todavía una política completa para incidencias, disponibilidad o estimación de esfuerzo.

## Decisiones y acuerdos

- Mantener el modelo de roles y permisos separado, añadiendo a los permisos un nombre obligatorio y una nota opcional.
- Adoptar una arquitectura por capas con backend Spring Boot, API REST, clientes React, PostgreSQL y Redis como base inicial.
- Mantener el proyecto y su gestión de tareas en GitHub mediante issues y un tablero Kanban.
- Estandarizar las issues mediante una plantilla común.
- Proteger la rama principal, trabajar a través de una rama de desarrollo y exigir en cada pull request la aprobación de los otros dos integrantes antes de integrar cambios.
- Registrar en la documentación las reuniones y las decisiones técnicas relevantes para conservar trazabilidad y facilitar la elaboración posterior de las memorias.
- Migrar la documentación existente en Notion a la documentación Zensical de `intranet/docs`.

## Tareas y próximos pasos

- **Salma:** investigar y crear la estructura inicial del backend con Spring Boot, incluyendo las dependencias necesarias y la configuración local con Docker; documentar la tarea en una issue, trabajar en una rama y presentar una pull request.
- **Adrián:** crear la plantilla común para las issues y configurar el proyecto de GitHub y su tablero Kanban para gestionar las tareas.
- **Miguel:** configurar el flujo de colaboración del repositorio en GitHub, incluida la protección de la rama principal, la creación de una rama de desarrollo y la exigencia de aprobación de los otros dos integrantes para integrar cada pull request.
- **Miguel:** migrar la documentación existente en Notion a la documentación Zensical ubicada en `intranet/docs`.
- **Miguel y Adrián:** revisar la pull request de la estructura inicial y señalar dependencias o ajustes que falten.
- **Equipo:** definir los módulos principales y, a partir de ellos, repartir la toma de requisitos y las primeras tareas de implementación.

## Puntos por explorar

- Elegir la versión de Java y justificarla, además de concretar las dependencias iniciales de Spring Boot.
- Definir la separación y conservación de logs técnicos y auditorías de negocio, y decidir si se incorporarán Grafana y Loki.
- Evaluar si Kafka aporta valor para notificaciones o procesamiento asíncrono; por ahora no se considera necesario para arrancar.
- Concretar el mecanismo de notificaciones programadas, incluida la alternativa de una tabla de eventos procesada mediante una tarea periódica.
- Confirmar las capacidades necesarias de la aplicación web progresiva, especialmente las notificaciones en dispositivos móviles.
- Acordar la política de sprints, estimación o registro de horas, reuniones, comunicación de bloqueos y actuación cuando una tarea no pueda completarse.
- Definir el despliegue y la publicación de la documentación sin exponer contenido que deba permanecer privado.
