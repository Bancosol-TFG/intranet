# Prompt: mockup visual del dashboard de la intranet (solo PC)

Implementa un **mockup visual navegable, no funcional**, del dashboard de la intranet en HTML, CSS y JavaScript vanilla. Todo el resultado debe quedar dentro de `mockup/`, en la raíz del repositorio. Los datos son ficticios y estáticos. Se evaluarán principalmente la presentación visual y la navegación entre vistas.

## 1. Reglas de ejecución

1. **Trabaja sin subagentes.** Las vistas comparten datos, estilos y calendario; mantén una única implementación coherente.
2. **Mantén la solución sencilla.** Sin frameworks, proceso de build, dependencias externas, CDN, fuentes remotas ni llamadas de red.
3. El mockup debe funcionar al abrir `mockup/index.html` con doble click (`file://`): utiliza scripts clásicos, no uses `type="module"`, `fetch` ni lectura de archivos locales desde JavaScript.
4. **Solo puedes escribir dentro de `mockup/`.** Puedes consultar únicamente las fuentes de modelo indicadas en §2, las instrucciones aplicables de `AGENTS.md` y la skill indicada en §3. No explores el resto del repositorio.
5. No crees README ni documentación, no cambies otros archivos y no hagas `git add` ni commits.
6. Escribe cada archivo una vez y evita ciclos de pulido. Al terminar, realiza una única revisión de la lista de aceptación (§11); corrige solo errores importantes de funcionamiento, navegación o accesibilidad visual.
7. La interfaz estará en **español**. Mantén los identificadores de código en inglés y sigue las instrucciones del repositorio. En particular, `AGENTS.md` prohíbe comentarios en código: organiza y nombra claramente los bloques CSS en lugar de añadir comentarios de sección.
8. **Todo es una simulación:** no hay backend, persistencia ni cambios reales. Los formularios, borrados, respuestas, altas, ediciones y confirmaciones solo muestran una interacción visual; los datos permanecen iguales.

## 2. Fuentes de verdad del modelo

Antes de escribir el mockup, consulta estas fuentes y ninguna otra para datos de dominio:

- `model.dbml`: esquema y relaciones. Referencias útiles:
  - Líneas 1–73: usuarios, roles y permisos.
  - Líneas 106–165: colaboradores, contactos, localidades y participación de colaborador en campaña.
  - Líneas 167–198: tipos de campaña y campañas.
  - Líneas 200–224: tipos de incidencia (`report_types`) e incidencias (`reports`).
  - Líneas 226–258: roles en tienda y tiendas.
  - Líneas 260–291: cadenas y participación de tiendas en campaña.
  - Líneas 293–333: horarios semanales y excepciones de horario.
  - Líneas 335–376: turnos, participaciones de voluntarios y asignaciones de turnos.
  - Líneas 378–405: zonas y asignaciones de zona por campaña.
- `api/src/main/resources/security/roles/`: catálogo con los nombres exactos de roles. Los códigos son `ADMIN`, `COORDINATOR`, `STORE-MANAGER`, `COLLABORATOR-MANAGER` y `VOLUNTEER`. Los archivos respectivos son `admin.yaml`, `coordinator.yaml`, `store-manager.yaml`, `collaborator-manager.yaml` y `volunteer.yaml`.

### Hechos del modelo que debes respetar

- La tabla de zonas es `zones` (el concepto/módulo se denomina `territory`); en la interfaz llámala **Zonas**. Una tienda puede tener `zone_id`; `zone_assignments` relaciona campaña, zona y usuario.
- El acceso de la vista de coordinador es una **simulación** de este mockup: limita sus datos a las zonas que le asignes en `zone_assignments` para la campaña seleccionada y a las tiendas participantes de esas zonas. El administrador ve todo el ámbito de la campaña. No deduzcas permisos reales a partir del mock.
- Una tienda tiene `store_participations` por campaña y el campo `participates`; muestra como participantes de la campaña solo los registros con `participates: true`. Los turnos dependen de esa participación.
- `store_roles` relaciona un usuario y un rol con una participación de tienda. El rol del catálogo para quien asigna turnos es **`STORE-MANAGER`**. En la interfaz usa una expresión neutral como **«persona que asigna los turnos»** o muestra el código del rol. No uses «responsable de tienda» ni presentes «responsable de grupo» como nombre confirmado del modelo: ninguno es el código de rol del catálogo.
- `collaborator_roles` relaciona usuarios y roles con una participación de colaborador en campaña. `collaborators` es la entidad colaboradora; no confundas la entidad con las personas que participan en ella.
- `volunteer_participations` vincula a un usuario con una participación de colaborador; `shift_assignments` vincula esa participación con un turno. Los voluntarios son datos protegidos: no muestres ni incluyas en la interfaz nombres, emails, teléfonos u otros datos que los identifiquen. Si hace falta identificar a alguien en un conflicto, usa únicamente un alias como «Voluntario V-07».
- Los horarios semanales están en `schedules` (`week_day` ISO 1–7, `opening_time`, `closing_time`). `schedule_exceptions` sustituye el horario semanal de una fecha y puede marcar el local como cerrado. Los turnos tienen fecha, hora de inicio y hora de fin.
- Las tiendas tienen nombre, dirección, cadena, localidad, zona y `checkout_shelfs`. Las cadenas tienen nombre y código; las zonas, nombre y código; las localidades, nombre y código postal. Usa esos datos, con etiquetas españolas claras, sin añadir atributos de dominio que no estén en el modelo.
- Las incidencias se representan con `reports` y `report_types`. Los campos disponibles incluyen descripción, fecha de creación, fecha de resolución, solución, persona que informa, persona que resuelve, campaña y tipo. El modelo no tiene un campo ni enum de estado de incidencia; en el mock deriva «Pendiente»/«Respondida» de la presencia o ausencia de `solution`, conforme a los requisitos de esta tarea. `resolution_date` aparece como no nula en el DBML aunque `solution` sea nullable: no uses la fecha por sí sola para afirmar que existe respuesta.
- Las campañas tienen tipo, nombre, fecha de inicio y fecha de fin. El modelo no define un enum/campo de estado «En curso» o «Pasada»; calcula la etiqueta desde las fechas usando una fecha de referencia fija del mock.
- No inventes enums de estado, relaciones ni restricciones que no estén en las fuentes anteriores. Distingue siempre los datos de dominio confirmados de los valores puramente ilustrativos del mock.

### Huecos del modelo: cómo cubrirlos sin atribuirlos al dominio

La experiencia solicitada necesita algunos datos que `model.dbml` no define. Represéntalos solo como **datos auxiliares ficticios del mock**, claramente separados de los campos modelados:

- El modelo no fija dos franjas diarias, ni horas oficiales de «mañana» y «tarde», ni un cupo de personas por turno. La vista debe mostrar exactamente dos bloques visuales diarios (mañana y tarde), agrupando los turnos ficticios por sus horas `start_time`/`end_time`. Para la fracción asignados/total, define un total ilustrativo por turno en los datos del mock; no lo derives de `checkout_shelfs` ni lo presentes como regla del modelo.
- El modelo no garantiza exactamente una persona asignadora por tienda ni enlaza directamente una participación de tienda con una entidad colaboradora. Para la demo asigna una persona con rol `STORE-MANAGER` a cada tienda que corresponda y deja una tienda sin asignación. Si necesitas identificar el colaborador de una tienda para el ejemplo de conflicto, añade una relación explícitamente mock-only; no la presentes como relación de base de datos.
- `shift_assignments` no guarda quién creó la asignación. Para el detalle de conflicto, la atribución a quien asignó el turno debe ser un dato ficticio auxiliar (por ejemplo, `mockAssignedByUserId`) vinculado a una persona no voluntaria con su rol y ficha de contacto.
- El modelo no conserva el historial de horarios anterior a una modificación. Representa el conflicto de horario como un escenario ficticio explícito: un turno queda fuera del horario vigente y el relato del mock indica que ese horario cambió después de asignarlo. No afirmes que el modelo guarda el historial del cambio.
- `model.dbml` no contiene una entidad o tabla de auditoría. Incluye la opción **Auditoría** en el panel de administrador como vista de solo lectura, pero muestra un estado vacío/«No definida en el modelo»; no inventes eventos, columnas ni registros de auditoría.
- Si necesitas una etiqueta, estado o dato que no aparece en estas fuentes ni en los requisitos, no lo presentes como hecho. Resuélvelo como detalle visual ficticio claramente identificable o prescinde de él.

## 3. Guía visual

Carga y utiliza la skill **`web-design-guidelines`** tanto como guía de diseño como en la única revisión final. Aplícala sin ampliar el alcance ni sustituir los requisitos de este prompt.

## 4. Estructura y funcionamiento técnico

Mantén esta estructura mínima:

```text
mockup/
├── index.html
├── css/styles.css
├── js/data.js
├── js/app.js
└── assets/logo.png
```

Solo si `app.js` resulta realmente inmanejable, puedes dividirlo en **hasta dos archivos JavaScript adicionales**, siempre dentro de `mockup/js/`.

- `index.html` contiene login, registro y todas las vistas de la aplicación, conmutadas por JavaScript.
- `data.js` define el objeto global de datos ficticios y `CONFIG`. `CONFIG.SHOW_SECTIONS_IN_NAV` debe ser booleano y controlar los enlaces de secciones de la navbar. Los bloques del home permanecen visibles siempre.
- Carga `data.js` antes que `app.js` mediante scripts clásicos locales. Usa rutas relativas.
- Implementa el PNG de `assets/logo.png` como un archivo válido, transparente y vacío. Referéncialo desde un `<img>` con tamaño fijado en CSS para que se pueda sustituir el archivo sin modificar la interfaz.
- Mantén los iconos como SVG inline reunidos en un único objeto JavaScript. No uses paquetes de iconos ni recursos externos.
- `styles.css` debe empezar con variables CSS para paleta, estados (correcto, pendiente, conflicto y fuera de campaña), espaciados, radios, sombras y tamaños de fuente. Usa pila de fuentes del sistema, modo claro, clases descriptivas y estilos editables; no uses preprocesadores ni estilos inline.

## 5. Acceso, campañas y navegación

### Login y registro

- Diseña pantallas sencillas y coherentes con el dashboard. Incluye navegación entre login y registro.
- Usa campos que correspondan a `users` (por ejemplo, email, contraseña, nombre, apellidos y teléfono); no añadas autenticación real ni guardes cuentas.
- Ofrece dos botones claramente marcados como **solo mock**: **Entrar como admin** y **Entrar como coord**. Corresponden respectivamente a `ADMIN` y `COORDINATOR`.
- El rol activo solo se selecciona desde el login; no añadas un selector de rol dentro de la aplicación ni al menú de cuenta. Tras entrar, muestra un indicador siempre visible con rol activo (código del catálogo y etiqueta en español).
- El registro es una simulación: valida visualmente los campos, muestra una confirmación breve y vuelve al login; no crea ni guarda una cuenta.

### Campañas

Incluye exactamente estas dos campañas de ejemplo:

| Campaña | Etiqueta | Requisitos |
|---|---|---|
| **Gran Recogida** | En curso | Seleccionada por defecto; datos completos e interacciones de demo. |
| **Recogida de Primavera** | Pasada | Datos reducidos y **solo lectura**: deshabilita claramente las acciones que afecten a esta campaña. |

Fija una fecha de referencia de demo en `data.js` para que las etiquetas no dependan del día en que se abra el archivo. Define fechas ficticias coherentes con esa referencia; el estado se deriva de ellas y no se añade como campo del modelo. Cambiar de campaña actualiza los datos y el estado de todas las vistas.

### Navbar

Incluye, en el orden visual que mejor encaje:

- Título de la campaña seleccionada; al pulsarlo, despliega el selector con nombre, tipo, fechas y etiqueta de estado derivada.
- Casa para volver siempre al dashboard de la campaña actual.
- Enlaces a **Zonas, Tiendas, Colaboradores, Incidencias y Calendario**, visibles u ocultos mediante `CONFIG.SHOW_SECTIONS_IN_NAV`.
- Estrella de acceso al panel de administración, visible **solo** con el rol `ADMIN`.
- Menú de persona con ajustes de cuenta maquetados y cierre de sesión. Cerrar sesión vuelve al login.
- Interrogante que abre tutoriales paso a paso propios de la página actual.
- Campana con desplegable de 2–3 notificaciones de ejemplo: una de calendario, una de incidencia y una de asignación/desasignación. Al pulsar una, abre su franja o incidencia correspondiente.

Los tutoriales **nunca se abren solos** ni muestran insignia, pulso, texto o señal que invite a abrirlos. Solo aparecen tras pulsar el interrogante.

## 6. Dashboard de campaña

El administrador entra al mismo dashboard de campaña que el coordinador. El coordinador ve un subconjunto claramente menor de zonas y tiendas, según las asignaciones ficticias de `zone_assignments`; el administrador ve todas las zonas y tiendas participantes de la campaña.

En 1920×1080, organiza el home para ver sus **seis bloques sin scroll de página**. Todos conducen a la vista o detalle correspondiente:

1. **Zonas:** resumen compacto.
2. **Tiendas:** resumen compacto.
3. **Colaboradores:** resumen compacto.
4. **Incidencias:** widget con solo 3–4 pendientes y enlace «Ver todas».
5. **Calendario:** widget protagonista, el bloque más grande, en semana por defecto.
6. **Estado de la campaña:** widget transversal, independiente del día visible en calendario.

El widget de estado contiene contadores clicables, calculados solo sobre el ámbito visible para el rol y la campaña. Como mínimo: tiendas sin persona asignadora, incidencias sin respuesta, conflictos activos, turnos pendientes y tiendas/franjas completas. Usa la semántica visual verde (completo), naranja (pendiente) y rojo (conflicto); cada contador conduce a una vista o popup útil. No añadas estados de dominio nuevos.

## 7. Vistas del dashboard

### 7.1 Zonas

- Muestra las zonas asignadas en la campaña: las del coordinador o todas para `ADMIN`.
- Usa tarjetas por defecto y un conmutador a tabla. **No incluyas mapa.** Los datos modelados son nombre y código; cualquier resumen adicional debe proceder de tiendas visibles.
- Al pulsar una zona, abre **Tiendas** con esa zona filtrada y un chip visible que se pueda quitar.

### 7.2 Tiendas

- Tabla densa y escaneable con buscador. Incluye solo las tiendas del ámbito del usuario y los campos útiles del modelo: tienda, cadena, localidad, zona, dirección, `checkout_shelfs`, horario/turnos y persona que asigna turnos.
- Si se llega desde Zonas, conserva el filtro como chip removible. El orden predeterminado de esta tabla será también el orden «Por defecto» en los popups de franjas.
- Pulsar una tienda abre un popup casi a pantalla completa con mini-dashboard: datos modelados relevantes, horario vigente, turnos/asignaciones, incidencias o información útil de la tienda y el mismo componente de calendario filtrado a esa tienda.
- Toda persona no voluntaria visible se puede pulsar para abrir su ficha de contacto.

### 7.3 Colaboradores

- Muestra los colaboradores que participan en la campaña, usando `collaborator_participations`; utiliza los datos de `collaborators`, `localities` y `contacts` cuando corresponda.
- Para voluntarios, elige contador o filas anonimizadas. No muestres ni incluyas en la interfaz nombres, emails, teléfonos u otros datos de contacto de voluntarios, tampoco en la vista de usuarios de administración. En datos JS conserva solo identificadores opacos/alias para ellos.
- Para personas no voluntarias —incluidos coordinadores y personas con rol `STORE-MANAGER`— muestra los datos de contacto ficticios disponibles y permite abrir su ficha desde cualquier vista.

### 7.4 Incidencias

- «Ver todas» abre la lista completa, con estado derivado visible para pendientes y respondidas. Usa los campos modelados de `reports`/`report_types`; no inventes un estado persistido.
- Al pulsar una incidencia, abre un popup con sus datos. Si `solution` está ausente, muestra una caja para escribir una respuesta simulada; al enviarla muestra una confirmación visual, pero no la guarda. Si existe respuesta, muéstrala en solo lectura y no permitas una segunda respuesta.
- Si aparecen personas, respeta siempre la protección de datos de voluntarios; las personas no voluntarias deben enlazar a su ficha de contacto.

### 7.5 Calendario

- Ofrece vistas de **día, semana y mes**, con **semana por defecto**. Reutiliza el componente en home y en el popup de tienda.
- Muestra exactamente dos franjas visuales por día: mañana y tarde. Usa turnos ficticios con horas coherentes con `schedules` y `schedule_exceptions`; las etiquetas mañana/tarde son una agrupación visual del mock, no una estructura adicional del modelo.
- Distingue solo estos estados, con texto/icono además del color:

  | Estado | Color y representación |
  |---|---|
  | Fecha fuera de campaña | Gris. |
  | Franja completa | Verde. |
  | Franja con asignaciones pendientes | Naranja. |
  | Franja con conflicto | Rojo más triángulo de peligro; prevalece sobre cualquier otro estado. |

- En cada franja, muestra la fracción asignados/total, calculada únicamente con las tiendas y asignaciones que puede ver el usuario. El total ilustrativo por franja es un dato mock-only, como se explica en §2.
- En vista mes, muestra un resumen por día. Si necesitas resumir varias franjas en una fecha, aplica esta regla visual derivada: conflicto si alguna franja visible tiene conflicto; si no, pendiente si alguna tiene asignaciones pendientes; verde solo si todas las franjas aplicables están completas; gris para días fuera de campaña. No lo presentes como un enum nuevo del modelo.
- Al pulsar una franja —o el resumen de día en mes— abre un popup con tiendas y su fracción. Permite alternar entre:
  1. **Por defecto:** mismo orden de la vista Tiendas.
  2. **Por estado:** completas, pendientes y con conflictos.
- Pulsar una tienda abre su popup encima del de franja. Los popups se apilan y solo se cierra el superior al pulsar fuera o Esc.
- Marca las tiendas con conflicto en rojo y con triángulo. Al abrir el detalle, muestra: colaborador ficticio implicado, persona no voluntaria que figura como asignadora con acceso a contacto, persona afectada solo como alias anonimizado (por ejemplo, «Voluntario V-07») y motivo.
- Incluye ambos escenarios en datos de la campaña en curso y asegúrate de que al menos uno de cada tipo cae dentro del ámbito visible del coordinador:
  1. La misma persona voluntaria, mediante alias, asignada en dos tiendas de un mismo colaborador durante la misma franja.
  2. Un turno que queda fuera del horario vigente de la tienda porque el horario cambió después de asignarlo. Es un relato/relación auxiliar ficticia, no historial almacenado por el modelo.

## 8. Panel de administración

Solo `ADMIN` puede abrirlo. Debe tener una página resumen con una tarjeta por entidad, datos clave y navegación propia (lateral o superior) coherente con el dashboard. Incluye las siete opciones solicitadas: **Tiendas, Cadenas, Colaboradores, Zonas, Auditoría, Usuarios y Campañas**. Las entidades con datos se ajustan a los campos de `model.dbml`; Auditoría conserva el estado vacío de solo lectura definido en §2.

- En cada entidad donde tenga sentido, ofrece ver en tabla con buscador, crear, editar y borrar. Los campos de tablas y formularios deben salir del modelo indicado en §2.
- Crear y editar abren modales. Borrar pide confirmación; tras confirmar, cierra el modal y puede mostrar un aviso, pero el registro **sigue presente**.
- Auditoría es siempre de solo lectura; no añadas botones de crear, editar o borrar.
- En Usuarios permite maquetar la edición de roles con los códigos del catálogo. No muestres contraseñas, hashes ni tokens. La asignación contextual de campañas/zonas no se edita desde Usuarios; el mock la representa en el contexto de campaña si hace falta.
- En Campañas incluye ver, editar y borrar en modo simulado, crear tipos de campaña y un asistente por pasos para emitir una campaña. El wizard debe terminar en una pantalla de confirmación explícita. Confirmar solo cierra el modal y puede mostrar un aviso; no crea nada.
- Al tener seleccionada la campaña pasada, las acciones que la modificarían deben aparecer claramente deshabilitadas. Ninguna acción modifica datos reales ni persiste cambios.

## 9. Datos y estados de ejemplo

Usa datos ficticios, verosímiles y consistentes entre relaciones. No pierdas tiempo verificando nombres reales. Incluye, como mínimo, en la campaña en curso: **20 tiendas, 4 cadenas, 2 colaboradores y 10 participaciones de voluntarios**. El resto de entidades tendrá una cantidad suficiente y del mismo orden de magnitud, sin inflar innecesariamente el mock.

En **Gran Recogida** tienen que verse todos estos casos:

- Franjas completas y pendientes.
- Los dos tipos de conflicto de §7.5.
- Días fuera de campaña.
- Una tienda sin persona asignadora.
- Una incidencia sin respuesta y otra con respuesta.
- 2–3 notificaciones de los tipos descritos en §5.
- Diferencia claramente perceptible entre el subconjunto de `COORDINATOR` y el ámbito completo de `ADMIN`.

La campaña pasada reutiliza una cantidad reducida de datos y toda acción que la afecte es de solo consulta. Usa valores ficticios también para contactos no voluntarios (por ejemplo, dominios reservados de ejemplo); no introduzcas datos personales reales. No guardes datos personales de voluntarios ni siquiera en objetos que luego no se rendericen.

## 10. Diseño e interacción

- Solo PC; optimiza para **16:9, 1920×1080** y modo claro. Prioriza un diseño moderno, azul como color primario, poco ruido visual y muchos datos visibles sin navegación innecesaria. El home no debe hacer scroll de página en esa resolución.
- Prefiere tablas y bloques densos, con jerarquía clara y espacios legibles. En vistas largas, evita que la tabla rompa el marco general de la aplicación.
- Mantén el CSS fácil de editar: variables arriba, valores semánticos y clases claras. Agrupa los estilos por orden y responsabilidad, sin comentarios de código conforme a `AGENTS.md`.
- Todos los botones, filtros, buscadores, ordenaciones, cambios de vista, selector de campaña, navegación, modales, popups y tutoriales deben reaccionar visualmente. Las acciones de escritura no deben alterar la fuente de datos.
- Los popups pueden apilarse; se cierran con Esc o click fuera solo en el nivel superior. El popup de tienda ocupa casi toda la pantalla; los demás se ajustan a su contenido.
- Las acciones deshabilitadas de la campaña pasada deben ser distinguibles por estilo y estado nativo de control cuando corresponda.
- Conserva foco visible, etiquetas de campos y controles semánticos. No comuniques estados únicamente con color: añade texto, icono o forma, incluyendo el triángulo de conflicto.

## 11. Revisión final y criterios de aceptación

Haz una sola revisión final con `web-design-guidelines` y comprueba:

- [ ] `mockup/index.html` abre por doble click (`file://`) sin errores de JavaScript ni recursos locales rotos.
- [ ] Login y registro funcionan como simulación; los dos botones de entrada activan roles distintos (`ADMIN`/`COORDINATOR`) y el rol activo es visible.
- [ ] La navbar incluye todos sus elementos; la estrella solo aparece para `ADMIN`; `CONFIG.SHOW_SECTIONS_IN_NAV` controla los enlaces de secciones sin ocultar los bloques del home.
- [ ] Se puede cambiar de campaña y la pasada muestra estado claro de solo lectura con acciones afectadas deshabilitadas.
- [ ] El home tiene los seis bloques y no requiere scroll de página en 1920×1080.
- [ ] Zonas permite tarjetas/tabla y enlaza a Tiendas con chip de filtro removible.
- [ ] Tiendas tiene tabla densa y buscador; al pulsar una tienda abre popup casi a pantalla completa con calendario.
- [ ] El calendario permite día/semana/mes, usa los cuatro estados acordados y prioriza rojo ante conflicto; el popup de franja ofrece los dos órdenes; pulsar una tienda apila su popup; el conflicto muestra alias anonimizado.
- [ ] No aparece ningún nombre ni dato de contacto de voluntarios en ninguna vista; cada persona no voluntaria visible permite abrir ficha de contacto.
- [ ] Incidencias: widget con solo pendientes, lista completa y popup que permite simular una única respuesta o muestra la respuesta existente en solo lectura.
- [ ] Notificaciones abren el popup correcto; cada tutorial es propio de su página y solo se abre al pulsar el interrogante.
- [ ] El widget «Estado de la campaña» está presente y sus contadores llevan a contenido útil.
- [ ] El panel admin tiene resumen y navegación propios, las siete opciones indicadas, buscadores/tablas donde corresponda, borrado con confirmación, creación con modal, auditoría solo lectura y wizard de campaña con confirmación final.
- [ ] En el mockup no aparece el término prohibido «responsable de tienda»; para quien asigna turnos se usa `STORE-MANAGER` o una expresión neutral.
- [ ] No se ha escrito nada fuera de `mockup/`.

Al terminar, informa brevemente qué se creó y si pasó la revisión. No añadas archivos de documentación ni hagas cambios fuera de `mockup/`.
