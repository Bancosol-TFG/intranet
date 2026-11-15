# SUPERPROMPT · Mockup visual del dashboard Bancosol

Actúa como agente de implementación para crear y mantener un mockup visual del dashboard de la intranet Bancosol. Sigue todas las instrucciones de este archivo y los cambios de producto que se detallan aquí; no vuelvas a decidir cuestiones ya fijadas.

## Objetivo

Construir una maqueta de escritorio que se juzga por su apariencia y navegación, no por persistencia de datos. Debe abrir directamente con doble clic en `mockup/index.html` (`file://`) y tener datos ficticios hardcodeados.

## Límites de ejecución

- Trabaja sin subagentes.
- Para la implementación del mockup, escribe solamente dentro de `mockup/`. No edites `.env`, archivos generados, `volumes/`, documentación ni otras partes de la aplicación.
- No añadas README ni dependencias, framework, build, CDN o fuentes externas.
- Usa HTML, CSS y JavaScript vanilla; scripts clásicos, sin `type="module"`, `fetch`, llamadas de red ni almacenamiento persistente.
- Datos simulados en `mockup/js/data.js` como objeto global.
- Usa la skill `web-design-guidelines` como guía de diseño y consulta sus reglas actuales para la única revisión final.
- Mantén una implementación sencilla y legible. Haz una única revisión final de errores, navegación y accesibilidad; corrige solo errores importantes.
- Interfaz y textos visibles en español; nombres de variables, funciones e identificadores de código en inglés.
- No guardes ni borres cambios: todas las acciones de creación, edición, respuesta, asignación y eliminación son simuladas. Sí deben funcionar las interacciones de la maqueta.

## Verificación del modelo y terminología

Antes de diseñar o cambiar datos, consulta solo el modelo de datos (`model.dbml`) y el catálogo de roles para entidades, relaciones, estados y nombres exactos de roles. No explores el resto del repositorio para este fin.

Usa literalmente los roles del catálogo:

- `ADMIN`
- `COORDINATOR`
- `COLLABORATOR-MANAGER`
- `STORE-MANAGER`
- `VOLUNTEER`

Reglas del modelo que debe reflejar la maqueta:

- `collaborators` son entidades colaboradoras; las participaciones de voluntariado pertenecen a esas entidades. No confundas la entidad colaboradora con una persona.
- Cada tienda tiene una sola persona que asigna turnos, vinculada a una entidad colaboradora. Muestra el rol exacto `STORE-MANAGER` y/o descríbela como «persona que asigna turnos»; no inventes una traducción de rol.
- Las zonas de la interfaz representan `zones` del modelo. Un `COORDINATOR` puede coordinar varias zonas y también tener el rol `STORE-MANAGER` en una tienda.
- Una incidencia admite una respuesta como máximo; una incidencia respondida es de solo lectura.
- Nunca muestres nombres ni datos de contacto de voluntarios, tampoco en el panel de administración. En conflictos usa alias anónimos como «Voluntario V-07»; en colaboradores y grupos muestra únicamente su conteo.
- Toda persona no voluntaria que aparezca en una vista debe abrir su ficha de contacto.
- Los conflictos se derivan de asignaciones y horarios: misma persona en dos tiendas del mismo colaborador durante la misma franja, o turno fuera del horario actualizado de la tienda.
- El DBML no define una tabla de auditoría. La vista solicitada debe indicar que sus eventos son datos de ejemplo y ser de solo lectura.

## Estructura requerida

```text
mockup/
├── index.html
├── css/styles.css
├── js/data.js
├── js/app.js
└── assets/logo.png
```

`index.html` contiene login, registro y todas las vistas conmutables. `assets/logo.png` es un PNG transparente válido, referenciado con `<img>` y dimensiones explícitas. Define `CONFIG.SHOW_SECTIONS_IN_NAV` en `data.js`: controla los enlaces de secciones de la navbar, pero nunca oculta los bloques del home.

## Acceso y roles

- Login y registro sencillos, visuales y en español.
- Dos acciones visibles y rotuladas como mock: **Entrar como admin** y **Entrar como coord**. El rol activo solo cambia desde el login.
- El rol activo debe mostrarse en la interfaz.
- Los dos perfiles entran al mismo dashboard de campaña; no cambies de rol dentro de la aplicación.
- `COORDINATOR` ve únicamente sus zonas y tiendas; `ADMIN` ve todo.
- Ambos roles entran al mismo dashboard de campaña.
- No incluyas voluntarios identificables en listas de usuarios, contactos, incidencias, tiendas, grupos ni auditoría.

## Navbar y separación de contextos

### Dashboard de campaña

Muestra campaña activa con selector, Casa, enlaces de secciones controlados por `SHOW_SECTIONS_IN_NAV`, estrella de administración solo para `ADMIN`, menú de cuenta, tutorial bajo demanda y campana con 2–3 notificaciones de ejemplo. Las notificaciones abren la franja, incidencia o tienda relacionada.

Los tutoriales son distintos por vista, paso a paso y solo aparecen tras pulsar el interrogante. No deben abrirse automáticamente ni tener insignias o animaciones que los sugieran.

La campana muestra 2–3 novedades de ejemplo —calendario, incidencias y asignación/desasignación— y cada una abre su popup correspondiente.

### Modo Administración

El panel de administración es un contexto distinto al dashboard de campaña. Mientras esté abierto:

- Oculta selector y nombre de campaña, enlaces de secciones de campaña, Casa, estrella de entrada y campana de campaña.
- Muestra una identidad clara de **Administración**, la cuenta activa y una acción visible **Volver a campaña**.
- Conserva un nav propio para Resumen y las siete entidades.
- No muestres el banner de solo lectura de la campaña ni deshabilites la gestión global por haber seleccionado una campaña pasada.

## Campañas

Incluye al menos estas dos campañas ficticias:

- **Gran Recogida**: en curso, completa e interactiva; predeterminada.
- **Recogida de Primavera**: pasada, datos reducidos y consulta de solo lectura; muestra un indicador claro y deshabilita las acciones de cambio del dashboard de campaña.

El cambio de campaña actualiza los datos de todas las vistas. La administración es global y no debe quedar supeditada a la campaña seleccionada.

## Home de campaña

Debe caber sin scroll de página en 1920×1080. El **calendario va primero**, a todo lo ancho y como bloque protagonista. Debajo coloca cinco widgets compactos:

1. Zonas.
2. Tiendas.
3. Colaboradores.
4. Incidencias pendientes (solo pendientes y enlace «Ver todas»).
5. Estado de la campaña.

Cada widget enlaza a su vista o a su acción. El calendario puede ocupar una fila; los demás widgets deben ser más bajos que el calendario y no forzar scroll de página.

## Vistas de campaña

### Zonas

- Tarjetas por defecto y conmutador a tabla. No incluir mapa.
- Resumen útil: código, tiendas y coordinador con ficha de contacto.
- Al abrir una zona, ir a Tiendas con chip de zona visible y removible.

### Tiendas

- Tabla densa con búsqueda por tienda, cadena, zona, localidad o persona que asigna.
- La columna **Turnos** muestra únicamente un estado: **Completo**, **Pendiente** o **Conflicto**. No pongas fracciones, totales, horas ni etiquetas adicionales en esa celda.
- Usa verde para completo, naranja para pendiente y rojo para conflicto; conflicto prevalece.
- No pongas un botón de Calendario junto a la búsqueda de tiendas.
- Abrir una tienda en un modal casi a pantalla completa con datos del modelo, horarios, cadena, zona, entidad colaboradora, persona `STORE-MANAGER` con ficha de contacto y calendario compacto de esa tienda.
- En la ficha de tienda, los turnos pueden mostrar cobertura y estado por franja; el calendario no debe crecer excesivamente en vertical.

### Colaboradores

- Muestra entidades colaboradoras, dirección/localidad, tiendas, contactos, responsable y grupos.
- Incluye acciones visuales para crear/modificar contacto, asignar responsable y ver grupos.
- Cada entidad tiene como mínimo un grupo. Para cada grupo muestra nombre, líder con ficha de contacto y conteo de voluntarios.
- Nunca muestres nombres, alias identificables ni contactos de voluntarios fuera del alias anónimo usado en un conflicto.

### Incidencias

- Lista todas las incidencias con estado visible y filtro entre pendientes y respondidas.
- Incidencia sin respuesta: formulario de respuesta simulada.
- Incidencia respondida: muestra la única respuesta y no ofrece responder otra vez.
- Las personas no voluntarias siempre abren su ficha de contacto.

## Calendario

- Día, semana y mes; semana por defecto.
- Incluye **Volver a hoy** en cada vista y en el calendario de tienda.
- Marca el día actual con un círculo de fondo en el encabezado del día o celda del mes.
- La escala horaria va de **08:00 a 23:00**, con guías horarias visibles. Las franjas se colocan verticalmente según sus horas, como eventos de un calendario. Ejemplo visual: mañana 10:00–14:00 y tarde 17:00–21:00.
- En día y semana, conserva el contenido de cobertura y estados, añade información útil de lo pendiente o erróneo y coloca conflictos en rojo.
- En día, muestra el detalle de tiendas pendientes, turnos que faltan y conflictos, con acceso al detalle de tienda o conflicto.
- En mes, **no dividas cada día en franjas**. Muestra un único resumen por día:
  - Rojo si hay cualquier conflicto.
  - Verde solo si todas las franjas de ese día están completas.
  - Naranja si falta asignar algo y no hay conflictos.
  - Gris fuera de campaña.
- Al abrir el resumen de un día, permite acceder a sus franjas y detalles.
- Las fracciones se calculan sobre las tiendas visibles del rol activo. En conflicto, muestra el colaborador, tiendas afectadas, persona que asignó el turno con contacto, alias anónimo de la persona afectada y motivo.
- Al abrir una franja, lista las tiendas con su fracción y permite ordenarlas por el orden de la vista Tiendas o por estado (completas, pendientes, conflictos). Abrir una tienda desde la lista apila su ficha.
- Incluye los dos conflictos: la misma persona asignada a dos tiendas del mismo colaborador en una franja y una asignación fuera del horario de tienda actualizado.
- Los popups se pueden apilar; Escape o click fuera cierra solo el superior.

## Estado de la campaña

Muestra contadores clicables del ámbito visible: tiendas sin `STORE-MANAGER`, incidencias sin respuesta, conflictos activos, franjas pendientes y franjas completas. Usa los estados verde, naranja y rojo del calendario, sin inventar estados adicionales.

## Panel de Administración

El resumen incluye una tarjeta por entidad y un nav propio para:

1. Tiendas.
2. Cadenas.
3. Colaboradores.
4. Zonas.
5. Auditoría.
6. Usuarios.
7. Campañas.

### Gestión común

- Tablas con búsqueda, columnas útiles y acciones de ver, editar, borrar y crear donde tenga sentido.
- Crear y editar abren modal; borrar exige confirmación y nunca elimina datos.
- Borrar siempre pide confirmación; confirmar cierra el modal y no cambia los datos.
- Todo formulario es una simulación y no persiste.
- Auditoría es solo lectura.
- En Usuarios el rol se puede editar, pero las asignaciones a campañas y zonas no se gestionan ahí.

### Campañas y tipos

- Un único botón **Crear campaña** abre el asistente; no dupliques la acción con otro botón «Emitir campaña».
- Conserva una acción separada para crear tipos de campaña.
- Asistente por pasos:
  1. Datos y rango de fechas.
  2. Franjas por cada día. Empieza con franjas de ejemplo y permite añadir/quitar cualquier cantidad por día, con hora de inicio y fin.
  3. Tiendas participantes: grupos desplegables por cadena, búsqueda, checkbox para toda la cadena y checkbox por tienda. La selección de cadena se deriva de sus tiendas: quitar todas las tiendas desmarca la cadena; seleccionar la cadena marca todas sus tiendas.
  4. Coordinadores:
     - Reutilizar asignaciones de la campaña anterior: entra a la pantalla de asignación ya rellenada para tiendas que participaron y tenían coordinador. Las tiendas nuevas quedan sin asignar.
     - Asignación manual: selector por tienda y modo lote por cadena o por zona.
     - Muestra un triángulo de advertencia en cada tienda sin coordinador.
     - Si se pulsa Siguiente con faltantes, no avances: desplázate y enfoca la primera tienda incompleta.
  5. Confirmación explícita final; confirmar solo muestra un aviso y no crea campaña.

### Zonas

- Desde una zona se puede abrir el listado completo de tiendas.
- Permite ver las tiendas de la zona y marcar/desmarcar tiendas para añadirlas o quitarlas en una simulación.

### Cadenas

- La lista de cadenas debe permitir abrir sus tiendas.
- Desde la cadena se puede ver, editar y borrar cada tienda, además de abrir Crear tienda con la cadena preseleccionada.
- Mantén también la creación, edición y borrado visual de cadenas.

### Colaboradores

- Añade contacto y responsable de entidad con ficha de contacto.
- Permite crear/modificar contactos y asignar `COLLABORATOR-MANAGER` como responsable en una simulación.
- Cada colaborador tiene al menos un grupo; lista líder con contacto y conteo de voluntarios solamente.

## Datos y escenarios

- Datos ficticios y hardcodeados: al menos 20 tiendas, 4 cadenas, 2 entidades colaboradoras y 10 voluntarios representados solo por conteo/alias anónimo.
- Incluye completo, pendiente, conflictos de ambos tipos, días fuera de campaña, tienda sin persona que asigna, incidencia pendiente y respondida, y 2–3 notificaciones.
- Coordinador ve un subconjunto claramente menor que admin.

## Diseño y accesibilidad

- Escritorio 16:9, Full HD 1920×1080; solo modo claro y color primario azul.
- CSS editable con variables al principio para colores, estados, espaciados, radios, sombras y tipografía. Clases claras y estilos sin preprocesador.
- Tipografía del sistema e iconos SVG inline definidos en un único objeto JS. Sin assets externos.
- Componentes densos y limpios; estados identificados por color y texto.
- Botones para acciones y enlaces para navegación; controles con etiquetas, botones de icono con `aria-label`, imágenes con `alt` y dimensiones, foco visible, skip link y `aria-live` para avisos.
- Respeta `prefers-reduced-motion`; no uses `transition: all` ni `outline: none` sin sustituto.
- Los popups son apilables, con Escape/click fuera solo para el superior y scroll interno cuando haga falta.

## Revisión final

Comprueba una sola vez:

- `index.html` abre directamente con `file://`, sin módulos, `fetch` ni errores JavaScript.
- Login/registro y perfiles ADMIN/COORDINATOR.
- Navbar campaña y navbar separada de Administración.
- Navegación de las vistas, filtros, tutoriales, notificaciones y popups.
- Día/semana/mes, eje 08:00–23:00, volver a hoy, marcador de fecha actual, resumen mensual por día y conflictos.
- Turnos en la tabla de Tiendas: únicamente Completo/Pendiente/Conflicto.
- Ficha de tienda compacta, privacidad de voluntarios y fichas de contacto.
- Asistente con franjas diarias, filtro y selección por cadena/tienda, asignación anterior/manual, lote, advertencias y bloqueo de coordinadores faltantes.
- Gestión de zonas, cadenas, tiendas y colaboradores; confirmar que ninguna acción altera datos.
- No se ha escrito fuera de `mockup/` para implementar el mockup.
