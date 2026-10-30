# Nota de reunión — 27 de octubre de 2026

## Datos de la reunión

- **Fecha:** 2026-10-27
- **Duración:** 0 h 34 min
- **Fuente:** `reunion-tfg-2026-10-27.json`, transcripción de `reunion-tfg-2026-10-27.mkv`.
- **Participantes:** Miguel, Adrián y Salma.

## Resumen

Reunión semanal de seguimiento. El equipo compartió su experiencia con el primer CRUD desarrollado con IA: la sensación de perder el control y el contexto del código generado, y las prácticas para mantenerlo (pruebas definidas de antemano, commits pequeños y validados, consulta previa de decisiones de arquitectura). También se revisó cómo se está organizando el acceso a la API en el frontend y cómo encadenar ramas y pull requests dependientes.

Se acordó cerrar las pull requests abiertas para que `dev` tenga ya una base común, y dedicar la semana a lo que más condiciona el resto de funcionalidades: usuarios, registro e inicio de sesión, roles y permisos, y la estructura del frontend. Cada persona investigará su parte y el trabajo se pondrá en común en una sesión presencial el viernes 30 de octubre por la mañana.

## Puntos tratados

### Desarrollo con IA

- Adrián explicó que el CRUD que subió no le convencía y que se planteaba escribir a mano las siguientes partes, porque no siente control sobre cada línea generada. Salma compartió una sensación parecida tras su primer intento.
- Salma propuso no revisar línea a línea, sino definir antes las pruebas que debe superar el código y pedir a la IA que consulte cualquier decisión importante de arquitectura o de relación entre archivos. También comentó que una refactorización amplia posterior puede dejar el código coherente si está bien definida, y que está probando qué flujo conviene más (orquestador con subagentes o subagentes lanzados a mano).
- Miguel señaló que, aunque se revise, no se tiene el mismo contexto que al escribir el código, algo que de todos modos pasará entre tres personas. Relacionó el uso de la IA con la complejidad que se espera de un TFG de tres personas.
- Miguel contó que descartó una primera generación que añadía una estructura de control de errores muy grande antes de existir el CRUD, porque obligaría a los demás a adoptarla y a rehacer su trabajo. Esa estructura se añadirá cuando haga falta.
- Sobre la revisión de cambios: Miguel limita los commits a unas 400 líneas para poder revisarlos y valida las pull requests antes de que la IA las publique. Adrián quiere revisar los diffs commit a commit desde VS Code y evitar que la IA haga commits sin su validación. Se mencionaron `git diff`, posibles extensiones del editor y las vistas de revisión de las propias herramientas. Cada persona configura esto en su flujo.
- Las descripciones de las pull requests se generan con la skill del proyecto y la persona autora las revisa antes de publicarlas. Adrián la usará también. Si se trabaja dentro del repositorio, la herramienta debería listar las skills disponibles.

### Frontend y acceso a la API

- Las implementaciones en curso acceden a la API de formas distintas: Adrián creó una carpeta `lib/api` con un cliente y una abstracción por recurso, y Salma un único archivo de API. Miguel advirtió que un único archivo crecería demasiado.
- Adrián propuso esta organización:
    - una carpeta `lib` para la funcionalidad compartida, y el resto para las páginas;
    - dentro de `lib`, una carpeta `api` con un cliente común que gestione las conexiones;
    - un archivo por dominio (por ejemplo, campañas) con sus tipos y operaciones, que use el cliente común.
- Miguel añadió que el cliente común podría centralizar la autenticación; por ejemplo, redirigir al inicio de sesión cuando una petición falle por falta de autenticación.
- Por ahora cada persona sigue con su enfoque. Cuando haya una estructura común se refactorizará para que todo use los mismos tipos y el mismo cliente.

### Ramas y pull requests dependientes

- Miguel insistió en integrar ya en `dev` una base organizada para que las nuevas funcionalidades sigan la misma estructura y no tengan que partir de ramas de otras personas.
- Se explicó cómo GitHub agrupa en una pila (*stack*) las pull requests encadenadas: si una rama sale de otra rama de trabajo, su pull request debe apuntar a esa rama, y la pila se integra en `dev` en conjunto. Salma mostró su pila de localidades, zonas y colaboradores (#43, #44 y #45).
- Las pull requests de Adrián para tipos de campaña (#41) y campañas (#42) dependen entre sí, pero ambas apuntan a `dev`, por lo que GitHub no las trata como pila. Se aclaró que deberían integrarse juntas, empezando por la base (tipos de campaña).
- Adrián planteó, para próximas ocasiones, sacar de `dev` una rama de la funcionalidad, crear de ella las ramas de las subtareas y dirigir sus pull requests a esa rama, que después irá a `dev`. Miguel estuvo de acuerdo cuando haya dependencias reales.
- Miguel explicó que encadenó sus ramas porque la segunda necesitaba migraciones y configuración de la primera, que todavía no estaban en `dev`. Matizó que el objetivo es que cada pull request sea una funcionalidad cerrada e independiente, y que estas situaciones se deben a que el proyecto está empezando.

### Organización semanal

- Las reuniones de los martes se usarán para revisar lo hecho en la semana, cerrar o terminar las pull requests pendientes y definir el trabajo de la semana siguiente.
- Adrián necesita que Salma revise su pull request para poder terminar la dependiente; Salma iba a revisarla después de la reunión.

### Usuarios, autenticación, roles y permisos

- Miguel pidió tener cuanto antes un sistema de usuarios, aunque sea básico, para que las funcionalidades nazcan comprobando permisos y no haya que rehacerlas. Explicó que gran parte de la complejidad de la aplicación está en los roles y en quién puede ver o hacer cada cosa, y que sin usuarios no se puede probar el frontend a mano.
- Sobre los tests generados: la IA crea muchos. Se mantienen si funcionan y se quitan los que no aportan, pero lo importante es poder probar la aplicación manualmente.
- Se debatió el reparto. Adrián propuso al principio separar el registro y el inicio de sesión y después unirlos en una sola tarea, que incluiría la gestión del token. Otra tarea diseñaría la tabla de permisos y los implementaría sin aplicarlos todavía a los endpoints, que seguirían abiertos.
- Salma propuso como tercera tarea definir el frontend: vistas y organización del código. Miguel estuvo de acuerdo y añadió que esta semana habrá que hablar mucho, porque son piezas esenciales y difíciles de separar, aunque cada persona se encargue de modificar su parte.
- Salma recordó que también hay que modificar la base de datos.
- Salma sugirió usar la IA con la transcripción para valorar el reparto, detectar tareas con fricción entre sí y proponer lo que falte.

## Decisiones y acuerdos

- Cerrar (integrar o dejar a punto) las pull requests abiertas para tener en `dev` una base común antes de seguir ampliando.
- La reunión de los martes se dedica a revisar lo hecho, cerrar lo pendiente y planificar la semana siguiente.
- Dar prioridad esta semana a usuarios, registro e inicio de sesión con gestión del token, roles y permisos, y estructura del frontend. Son tareas separadas, pero se coordinarán durante la semana.
- Mientras no exista una estructura común del frontend, cada persona mantiene su forma de acceder a la API y se refactorizará después hacia un cliente común con módulos por dominio.
- Cuando haya pull requests dependientes, encadenarlas como pila apuntando a la rama de la que dependen. Como objetivo general, cada pull request debe ser una funcionalidad independiente.
- Sesión de trabajo presencial el viernes 30 de octubre por la mañana para poner en común lo investigado y avanzar juntos.

## Tareas y próximos pasos

- **Salma:** revisar la pull request de Adrián que bloquea su trabajo dependiente.
- **Adrián:** completar e integrar en orden las pull requests de tipos de campaña (#41) y campañas (#42).
- **Equipo:** cerrar las demás pull requests abiertas.
- **Equipo:** antes del viernes, investigar cada tarea:
    - registro, inicio de sesión y gestión del token;
    - diseño de roles y permisos y de su tabla, sin aplicarlos aún a los endpoints;
    - estructura del frontend: vistas, organización del código y cliente común de API.

    El reparto concreto entre personas no quedó cerrado en la reunión.
- **Equipo:** el viernes, poner en común lo investigado, enseñar lo que ya se haya avanzado y empezar con los cambios de base de datos necesarios.

## Puntos por explorar

- Reparto definitivo de las tres tareas entre Miguel, Adrián y Salma.
- Hora y lugar de la sesión del viernes: se habló de empezar entre las 10:00 y las 11:00 y trabajar unas horas, en casa de Miguel o en la universidad.
- Mecanismo de autenticación y gestión del token. ADR-0015 deja la autenticación de la API por detallar.
- Alcance del «registro»: ADR-0003, en estado *Proposed*, no ha decidido quién crea las cuentas ni si habrá autorregistro, alta administrada o invitación. La tarea de registro depende de esa decisión.
- Diseño de roles y permisos dentro de lo ya decidido en ADR-0012 (roles y permisos separados) y ADR-0005 (alcance por campaña), y cómo y cuándo se aplicarán a los endpoints.
- Estructura común del frontend y del cliente de API: ubicación de `lib`, organización por dominio y gestión de errores de autenticación.
- Flujo de ramas: la skill `tfg-branch-conventions` indica que toda rama de trabajo sale de `origin/dev` y vuelve a `dev`, mientras que en la reunión se habló de ramas de funcionalidad con subramas y pilas de pull requests. Conviene decidir si se recoge esa variante en las convenciones.
- Cambios de base de datos que necesiten usuarios, roles y permisos.
- Salma quería compartir un problema con las migraciones fuera de la grabación; no consta en la transcripción.
