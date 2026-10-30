# Nota de reunión — 20 de octubre de 2026

## Datos de la reunión

- **Fecha:** 2026-10-20
- **Duración:** 0 h 44 min
- **Fuente:** `reunion-tfg-2026-10-20.json`, transcripción de `reunion-tfg-2026-10-20.mkv`.
- **Participantes:** Miguel, Adrián y Salma.

## Resumen

La reunión revisó el estado de los repartos de tareas de la semana anterior, que no estaban terminados, y definió cómo trabajar con IA en el proyecto: qué información debe ir en `AGENTS.md`, qué procedimientos en skills, qué criterios de código y documentación se comparten y qué se deja a cada persona. Se acordó entregar cada funcionalidad completa (backend, frontend conectado, tests, documentación y permisos por rol) y consultar al equipo antes de cualquier decisión de arquitectura o tecnología propuesta por la IA. Quedaron abiertos la estrategia de autenticación, el momento de escribir los tests y la revisión conjunta de un documento recibido con dudas sobre el proyecto.

## Puntos tratados

- **Estado del trabajo:** Las tareas repartidas en la reunión anterior no están terminadas y algunas no se han empezado. Se propuso avanzar esta semana en las issues ya asignadas, incorporando el frontend cuando sea posible.
- **Organización con issues:** Se descartó un tablero Kanban. Las issues generales se revisan en las reuniones y cada persona, al asignarse una, concreta las subtareas que va a trabajar. Se comprobó que una de las issues generales todavía no se había creado.
- **Autenticación y usuarios:** Se propuso añadir cuanto antes un sistema de usuarios, aunque sea provisional y sin validación real. Se advirtió de que el mecanismo de autenticación debe decidirse antes de implementarlo y no dejarse a la IA.
- **Entrega por funcionalidad:** Cada funcionalidad debe quedar completa: backend, frontend conectado con él, tests, documentación y, si hay una decisión relevante, un ADR. Cada endpoint debe declarar los roles que pueden usarlo.
- **Tests:** Se debatió si escribirlos desde el principio o al final. Miguel defendió que comprueben comportamiento real y no sean pruebas triviales. No se tomó una decisión.
- **Flujo de trabajo con IA:** Cada persona puede elegir sus herramientas, modelos, planes y forma de lanzar subagentes, porque el consumo de tokens y los planes disponibles son distintos. Lo común sería un pipeline mínimo: documentar antes y después de cada tarea, y usar las mismas plantillas de issues, commits y pull requests. Se explicó que `AGENTS.md` se lee siempre, por lo que debe ser breve y enlazar a la documentación, mientras que las skills se cargan cuando la IA considera que aplican y no se pueden garantizar al cien por cien. Las reglas de código pueden ir en una sección propia de `AGENTS.md`.
- **Convenciones de código:** Identificadores en inglés; constantes en mayúsculas al inicio del archivo, justo debajo de los imports; funciones y variables en camelCase; funciones cortas, reutilizables y con nombres descriptivos; sin comentarios. El objetivo es que el código de las tres personas sea homogéneo, ya que buena parte lo generará la IA.
- **Módulos y arquitectura:** Se repasaron los módulos de backend (Users, Auth, Collaborator, tiendas, Campaigns, Logs, Territory, Turns, Auditory, Notifications y Reports) y las carpetas de cada módulo (Controller, DTO, Entity, Exception, Repository y Service). Se planteó si crear el esqueleto de los módulos desde el principio o según avance, sin cerrarlo. Miguel propuso una migración inicial con todas las tablas comentadas hasta ahora; se comentó que cambiar la tabla de colaboradores tendría poco coste.
- **Documentación y TFG:** Los diagramas C4 se incorporarán a la documentación cuando estén terminados, en lugar de pasarlos a la IA como imagen, por su coste en tokens. La documentación se actualiza junto con el código y se valoró reorganizarla más adelante, también pensando en las memorias individuales del TFG. Se mencionó un changelog; se consideró que el historial de commits y pull requests podría bastar, sin cerrar el tema.
- **Planificación:** Se propuso dedicar esta semana a probar el flujo con IA en el CRUD básico del backend. Los martes se usarían como sesiones de revisión y de reparto de tareas. La revisión del documento de dudas se haría en una reunión aparte, con fecha por confirmar.

## Decisiones y acuerdos

- Se trabaja con issues generales revisadas en reunión y subtareas definidas por cada persona al asignarse una. No se usará Kanban.
- Cada funcionalidad se entrega completa: backend, frontend conectado, tests, documentación y ADR cuando proceda.
- Cada endpoint declara los roles que pueden usarlo. Si no se especifican, la IA debe preguntarlos antes de implementarlo.
- Si la IA propone un cambio de arquitectura o una decisión tecnológica relevante, se consulta al equipo y se registra como ADR con la estructura existente.
- Identificadores en inglés; constantes en `UPPER_SNAKE_CASE` al inicio del archivo; funciones y variables en `camelCase`; sin comentarios en el código.
- Cada módulo usa las carpetas Controller, DTO, Entity, Exception, Repository y Service. Cualquier carpeta adicional o módulo nuevo requiere validación humana.
- Cada persona decide su flujo de trabajo con IA, sus modelos y la ejecución de sus subagentes. El proyecto recoge solo el pipeline común y las reglas compartidas.
- `AGENTS.md` se mantiene breve y enlaza a la documentación y a las skills; los procedimientos repetibles (migraciones, commits, pull requests, issues) van en skills.
- Antes de empezar a programar en serio se quieren tener listas las skills y las reglas compartidas.

## Tareas y próximos pasos

- **Miguel:** actualizar hoy o mañana las skills y `AGENTS.md` con lo acordado, validarlo con el equipo y fusionarlo en `dev`.
- **Equipo:** después de esa fusión, actualizar desde `dev` las ramas abiertas para tener las skills y las reglas nuevas.
- **Equipo:** avanzar en las issues asignadas esta semana, probando el flujo con IA en el CRUD básico del backend y conectándolo con el frontend.
- **Equipo:** crear la issue general que todavía falta.
- **Equipo:** leer el documento recibido con las dudas del proyecto en una reunión aparte, con fecha por confirmar. Se barajó el domingo, por la mañana o al mediodía, durante una o dos horas.

## Puntos por explorar

- Estrategia de autenticación: qué mecanismo usar, si se empieza con un sistema provisional y cómo se registra la decisión.
- Momento de escribir los tests (al principio o al final) y alcance de cada tipo de prueba.
- Alcance de la migración inicial: si incluye todas las tablas hablada hasta ahora y cómo tratar los cambios posteriores de tablas.
- Creación de los módulos: esqueleto desde el inicio o según avance.
- Nombre del módulo de tiendas: la transcripción lo menciona como «Stories» y como «Shops». `AGENTS.md` lista `Shops`, mientras que el diagrama de componentes de C4 usa `Stores`, y el último cambio de documentación sustituye `Shops` por `Stores`. Hay que unificar el nombre.
- Changelog: si hace falta un registro separado o basta con el historial de commits y pull requests.
- Reorganización de la documentación pensando en la memoria del TFG.
- Fecha y hora de la reunión sobre el documento de dudas y de la sesión de revisión de los martes.
