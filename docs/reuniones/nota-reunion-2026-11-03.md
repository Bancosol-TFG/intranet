# Nota de reunión — 3 de noviembre de 2026

## Datos de la reunión

- **Fecha:** 2026-11-03
- **Duración:** 0 h 50 min
- **Fuente:** `reunion-tfg-2026-11-03.json`, transcripción de `reunion-tfg-2026-11-03.mkv`.
- **Participantes:** Miguel, Adrián y Salma.

## Resumen

Reunión semanal de seguimiento y planificación del segundo sprint. Cada miembro repasó lo entregado (refactorización del frontend según la skill de estructura, registro de usuarios y control de tokens, y sistema de roles y permisos), se discutió cómo evitar refactorizaciones repetidas del frontend y se repartieron las tareas del sprint 2. También se acordaron prácticas de trabajo: registrar todo en el backlog como issues, dividir las pull requests por funcionalidad y reservar un momento para decidir las vistas del frontend.

## Puntos tratados

- **Trabajo entregado:**
    - Refactorización del frontend siguiendo la skill de estructura del frontend; la pull request está cerrada y, en principio, todo funciona.
    - Registro de usuarios y control de tokens, ya integrados. Queda un detalle menor: al refrescar el token podría enviarse también el access token. Se corrigió además una línea de la configuración de Flyway que no se había subido.
    - Sistema de roles y permisos: está hecho, pero solo existe el rol de administrador; faltan rellenar el resto de roles, la documentación y las pruebas por rol. Su frontend se desarrolló en una carpeta aparte (prototipo) para evitar conflictos y queda pendiente integrarlo en el frontend principal. La pull request está pendiente de revisión.
- **Refactorizaciones del frontend:** se debatió por qué se hizo un frontend paralelo si la estructura ya estaba definida en la skill. Se señaló que, cuando una tarea crece, es preferible dejar el frontend como subtarea aparte o pedir a la IA que siga la skill existente. Se reconoció que el frontend se volverá a refactorizar cuando se decida el diseño visual.
- **Componentes compartidos y diseño:** cada miembro tiene sus propios componentes; conviene extraer componentes reutilizables a una carpeta compartida. Se insistió en decidir pronto las vistas (pantallas, paleta, estilo de botones) para que el frontend no se quede atrás.
- **Población de roles:** se valoró cargar los roles y permisos desde un archivo estático (por ejemplo, JSON) al arrancar la base de datos por primera vez, o mediante código Java. Se aclaró que Drizzle es solo un visor de la base de datos y no sirve para poblarla.
- **Pruebas:** se planteó que los criterios de aceptación pasen a exigir pruebas por rol en cada endpoint. Hubo preocupación por el volumen de pruebas que genera la IA frente al código funcional.
- **Validación de DTOs:** se detectó que varios DTOs no tienen validaciones, por lo que pueden llegar valores nulos o inválidos. Se creó una issue, no prioritaria.
- **Instrucciones para la IA:** se debatió si añadir reglas como la validación de DTOs al `AGENTS.md` o a skills separadas. Se argumentó que `AGENTS.md` se lee en cada petición y que llenarlo de reglas aumenta el consumo; se propuso separar skills de frontend y backend si las especificaciones crecen. También se observó que la IA tiende a imitar el código existente, por lo que una buena base corrige el resto.
- **Modelo de datos:** se han alineado tipos y nombres con `model.dbml`. Se recordó que DBML tiene su propia sintaxis y que lo importante es que relaciones, atributos, nulabilidad y notas estén al día.
- **Integración entre módulos:** módulos desarrollados por separado (por ejemplo, tiendas y zonas) están relacionados en la base de datos, pero no en el código. Se propuso que haya tareas específicas para integrar las funcionalidades.
- **Swagger:** se propuso añadirlo para documentar y probar los endpoints, y estudiar la generación automática de tipos del frontend a partir de los DTOs del backend.
- **Organización:** se creó el milestone del sprint 2 y una vista del proyecto de GitHub con el sprint actual.

## Decisiones y acuerdos

- Toda idea, error o tarea pendiente, por pequeña que sea, se registra como issue en el backlog; en cada reunión se mueven issues del backlog al sprint y se asignan.
- Dividir las pull requests por funcionalidad y separar cambios específicos (como modificaciones del `AGENTS.md`) en pull requests pequeñas.
- Reparto del sprint 2:
    - Miguel: añadir Swagger, desarrollar su parte del frontend (tiendas, horarios), refactorizar el frontend de roles y extraer componentes reutilizables.
    - Adrián: carpeta de ADR, realinear el `AGENTS.md`, pruebas para todos los roles y rellenar los roles.
    - Salma: integración de las funcionalidades entre módulos e issue sobre las vistas del frontend.
- Se puede adelantar trabajo con issues ya definidas fuera de la reunión semanal; lo que no se termine pasa al siguiente sprint.

## Tareas y próximos pasos

- Reunirse el miércoles 4 de noviembre para trabajar en las vistas del frontend.
- Integrar el frontend de roles y permisos en el frontend principal.
- Documentar el sistema de roles y permisos.
- Revisar la pull request de roles y permisos antes de integrarla.
- Revisar y probar la invalidación de tokens al cambiar permisos, que está implementada pero sin probar.
- Añadir validaciones a los DTOs (issue creada, no prioritaria).
- Revisar si quedan issues abiertas ya terminadas.

## Puntos por explorar

- Formato para poblar roles y permisos: archivo estático (JSON u otro) o código Java.
- Dónde definir las reglas para la IA: `AGENTS.md` o skills separadas de frontend y backend.
- Generación automática de tipos del frontend a partir de los DTOs del backend.
- Volumen adecuado de pruebas generadas por la IA.
- Diseño visual del frontend: pantallas, paleta y componentes.
- Posible envío del access token al refrescar el token.
