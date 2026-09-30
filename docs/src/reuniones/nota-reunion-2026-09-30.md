# Nota de reunión — 30 de septiembre de 2026

## Datos de la reunión

- **Fecha:** 2026-09-30
- **Duración:** 2 h 20 min
- **Fuente:** `reunion-3009-tfg.json`, generado a partir de `ReunionTFG-3009.m4a`
- **Participantes:** Adrian, Salma y Miguel.

## Resumen

El equipo trabajó sobre los diagramas C4 y la división funcional de la aplicación, y comenzó a esbozar requisitos para tiendas, cadenas y campañas. Se manejó como visión de trabajo una intranet web y una aplicación móvil PWA con un backend compartido. La conversación dejó sin resolver aspectos importantes del registro y la participación de voluntarios, la gestión de grupos y los permisos. Para avanzar sin fijar supuestos de negocio, el equipo planteó preparar preguntas y pedir a Bancosol un flujo detallado de su trabajo antes de cerrar esos requisitos.

## Puntos tratados

- **Diagramas y arquitectura:** Se planteó elaborar los niveles 1 a 3 de C4, sin el nivel de código. Se habló de representar un sistema con dos aplicaciones frontend —la intranet y la PWA móvil— que consumirían el mismo backend. El detalle de contenedores, módulos, componentes compartidos y servicios externos sigue por concretar. Se comentó que los diagramas deben reflejar el estado actual y actualizarse al evolucionar el diseño. La fuente de los horarios y excepciones de las tiendas —datos facilitados por las cadenas u otro sistema— no quedó confirmada.
- **Módulos del sistema:** Se exploraron posibles módulos para usuarios, autenticación y permisos, tiendas y cadenas, campañas, turnos, colaboradores, incidencias o reportes, notificaciones, auditoría y logs. También se debatió dónde agrupar zonas y localidades y cómo ubicar las participaciones entre módulos. La lista y sus límites son provisionales; no se cerró una arquitectura de carpetas ni la responsabilidad de cada módulo.
- **Aplicaciones y funcionalidades:** Se habló de diferenciar las funciones de gestión de la intranet de las vistas de la PWA para voluntarios y otros perfiles. Entre las ideas para móvil aparecieron consultar turnos y tiendas asignadas, recibir notificaciones y enviar reportes; entre las de intranet, administrar campañas, usuarios, turnos y reportes. La selección final de vistas y permisos no quedó definida.
- **Usuarios, voluntarios y grupos:** Se discutieron alternativas incompatibles para altas y acceso: cuentas para todas las personas o separar voluntarios de usuarios con credenciales; credenciales asignadas o autorregistro; aprobación de cuentas y/o de participación en campañas; y gestión individual o por grupos, entidades colaboradoras y responsables. También surgieron casos de menores y personas mayores, y la posibilidad de que un colaborador remita datos para su aprobación. No se resolvió el flujo ni su impacto en el modelo de datos.
- **Primeros requisitos de tiendas y campañas:** Se esbozaron funciones para consultar y filtrar tiendas según permisos, crear/editar/eliminar tiendas y cadenas, gestionar horarios y excepciones, vincular una tienda a una cadena y seleccionar cadenas al crear una campaña. Se planteó derivar de esas cadenas las tiendas participantes y permitir ajustes individuales. También se debatió si los coordinadores verían solo campañas actuales o su historial. Son apuntes iniciales que requieren formalización y validación.
- **Planificación y documentación:** Se propuso avanzar con requisitos por módulo, comenzando por tiendas, y preparar preguntas para una próxima conversación con Bancosol sobre sus procesos reales. Se comentó que el flujo de la aplicación y los casos de uso ayudarían a concretar requisitos; quedó por confirmar con el tutor qué diagramas son necesarios. Se mencionaron posibles ADR para decisiones de credenciales y visibilidad histórica, pero esas decisiones no se tomaron en esta reunión.

## Decisiones y acuerdos

- Elaborar los niveles 1, 2 y 3 de C4; se dejó fuera el nivel de código.
- Representar los diagramas como una descripción del estado actual, revisable conforme avance el diseño.
- Empezar a redactar requisitos funcionales por módulos, comenzando por el módulo de tiendas y por las funciones que el equipo ya puede describir.
- Preparar preguntas para Bancosol y solicitar que explique su flujo de trabajo para aclarar los casos que condicionan el registro, los grupos, las campañas y la gestión de datos.

## Tareas y próximos pasos

- **Equipo:** preparar una batería de preguntas y pedir a Bancosol un flujo detallado de sus procesos, incluidos el alta y la aprobación de voluntarios, la participación individual o en grupo, la gestión de campañas y la forma de recibir datos de tiendas y colaboradores.
- **Equipo:** continuar los requisitos de tiendas y cadenas, indicando quién puede consultar o modificar cada dato y cómo se relacionan tiendas, cadenas y campañas.
- **Equipo:** concretar el flujo de la intranet y de la PWA, así como los diagramas C4 que faltan, una vez aclarados los límites del sistema y los procesos de negocio.
- **Equipo:** confirmar con el tutor qué diagramas y casos de uso se requieren para el TFG.

## Puntos por explorar

- Definir actores y límites del sistema, incluyendo los perfiles que usan la intranet o la PWA y la posible fuente externa de horarios de tienda.
- Acordar el modelo y el ciclo de vida de usuarios y voluntarios: quién puede crear cuentas, cómo se entregan credenciales, qué se aprueba, cómo se representa la participación por campaña y cómo se gestionan grupos y colaboradores.
- Aclarar con Bancosol los casos reales de menores, personas mayores, voluntariado individual, grupos y envío o carga de datos; no se debe cerrar el modelo de datos antes de validar estos flujos.
- Concretar el alcance histórico de los permisos de coordinadores y otros perfiles, y qué acciones se permiten al retirar una cadena o tienda de una campaña cuando ya hay asignaciones relacionadas.
- Cerrar la división de módulos y el uso compartido de componentes y lógica entre ambos frontends; decidir dónde quedan reportes, auditoría, logs, zonas y localidades.
- Completar el flujo de la aplicación y decidir si se elaborará el diagrama dinámico de C4.
- La nota del 22 de septiembre registra Redis como caché prevista; en esta reunión se propuso omitirlo del diagrama porque no formaría parte del estado representado en ese momento. Confirmar si cambió la decisión arquitectónica o si solo se aplazó su representación.
