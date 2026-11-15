# SUPERPROMPT — Mockup visual del dashboard de la intranet

Actúa como agente de implementación y crea un mockup visual, navegable y no funcional del dashboard de la intranet. Este prompt debe poder ejecutarse sin contexto de conversaciones anteriores: sigue todas las instrucciones aquí descritas y consulta únicamente el modelo de datos necesario para resolver discrepancias.

## 1. Alcance y reglas

- Trabaja sin subagentes.
- La interfaz debe estar en español. Usa inglés para nombres de archivos, variables y funciones.
- El mockup vive en `mockup/` en la raíz del repositorio. No escribas código ni datos fuera de esa carpeta. No edites `.env`, archivos generados, documentación del proyecto ni datos reales.
- No crees README ni dependencias. No uses frameworks, build tools, CDN, fuentes remotas ni `fetch`.
- Usa HTML, CSS y JavaScript vanilla. La página debe funcionar al abrir `mockup/index.html` con doble clic (`file://`): scripts clásicos, datos en un objeto global de `js/data.js` y rutas relativas locales.
- Todo es una simulación: formularios, altas, cambios, borrados, asignaciones, emisión de campañas y respuestas no se guardan, no mutan los datos y no usan `localStorage`. Las confirmaciones deben cerrar la ventana y mostrar un aviso, dejando los datos iguales.
- No hagas commits ni stages. No crees archivos adicionales fuera de los permitidos.
- Planea la implementación completa antes de editar y evita ciclos de pulido. Al terminar la implementación, detente y pregunta: **“¿Quieres que continúe con la fase de testeo?”**. No empieces esa fase hasta recibir un “sí”. Si se autoriza, por ahora el testeo consiste únicamente en analizar el código escrito; no ejecutes pruebas, no abras el navegador ni inicies servidores.

## 2. Estructura de salida

```text
mockup/
├── index.html
├── css/styles.css
├── js/data.js
├── js/app.js
└── assets/logo.png
```

`app.js` puede dividirse en un máximo de dos archivos JavaScript si resulta imprescindible. `logo.png` debe ser un PNG válido y totalmente transparente, listo para sustituir. Referéncialo con `<img>` y dimensiones fijas y `alt` adecuado.

En `data.js` define `CONFIG.SHOW_SECTIONS_IN_NAV` como booleano. Controla únicamente los enlaces de sección de la barra de navegación; los bloques del dashboard permanecen siempre visibles.

## 3. Modelo de datos y terminología verificados

Antes de crear datos, lee solamente `model.dbml` y el catálogo de roles si es necesario para confirmar nombres exactos. No explores el resto del repositorio.

El modelo comprobado incluye:

- `users`, `roles`, `user_roles`, `role_permissions` y entidades de seguridad.
- `collaborators`: entidades colaboradoras (organizaciones), no personas individuales. `collaborator_participations` las vincula a campañas; `volunteer_participations` vincula los usuarios voluntarios con una participación de colaborador.
- `stores`, `chains`, `localities`, `store_participations`, `store_roles`, `schedules`, `schedule_exceptions`, `shifts` y `shift_assignments`.
- `zones` y `zone_assignments` por campaña y usuario.
- `campaign_types`, `campaigns`, `reports` y `report_types`. La respuesta de una incidencia se representa en `solution`; muestra como máximo una respuesta por incidencia.
- El modelo actual no contiene una tabla de auditoría. El panel debe mostrar una vista de auditoría claramente marcada como datos de muestra y solo lectura.

Los nombres exactos del catálogo de roles son:

- `ADMIN`
- `COORDINATOR`
- `COLLABORATOR-MANAGER`
- `STORE-MANAGER`
- `VOLUNTEER`

La persona que asigna los turnos de una tienda usa el rol de modelo `STORE-MANAGER`; no inventes otro nombre para ese rol. Un coordinador puede también tener ese rol. Cada tienda participante de los datos de muestra tiene como máximo una persona que asigna turnos, perteneciente a una entidad colaboradora; incluye una tienda sin persona asignada.

Usa **Zonas** como nombre de interfaz para `zones` (territory del modelo). No confundas la entidad colaboradora con sus contactos o grupos. No uses nunca el término **“responsable de tienda”** en la interfaz ni en el código.

### Privacidad del voluntariado

- En ninguna vista muestres nombres reales ni datos de contacto de voluntarios.
- Puedes mostrar conteos y alias anónimos requeridos para explicar un conflicto, por ejemplo `Voluntario V-07`.
- Coordinadores, `STORE-MANAGER`, `COLLABORATOR-MANAGER` y demás personas no voluntarias sí deben tener una ficha de contacto accesible desde cada nombre que aparezca.
- En cada grupo de colaborador muestra líder y conteo de voluntarios, nunca sus datos personales. Debe haber al menos un grupo por entidad.

## 4. Datos de muestra

Usa datos ficticios, sencillos y hardcodeados:

- Como mínimo 20 tiendas, 4 cadenas, 2 entidades colaboradoras y 10 voluntarios representados solo mediante datos anónimos/conteos. Unos 24 establecimientos, 5 zonas, 12 alias anónimos y 2–3 coordinadores son suficientes.
- Incluye usuarios/contactos no voluntarios con nombre, correo, teléfono y los roles exactos del modelo.
- Cada entidad colaboradora debe tener contactos, responsable con rol `COLLABORATOR-MANAGER` y al menos un grupo con líder identificable.
- Campañas:
  - **Gran Recogida**: en curso, completa e interactiva, predeterminada.
  - **Recogida de Primavera**: pasada, solo lectura, con conjunto más pequeño de datos.
- Incluye franjas completas, pendientes y conflictos; días fuera de campaña; una tienda sin `STORE-MANAGER`; una incidencia pendiente y otra respondida; 2–3 notificaciones.
- Incluye estos dos conflictos en la campaña en curso:
  1. La misma persona voluntaria asignada a dos tiendas del mismo colaborador en la misma franja.
  2. Un turno asignado fuera del horario de apertura porque el horario cambió después de asignarlo.
- Los detalles del conflicto indican las tiendas, entidad colaboradora, rol/persona que asignó, alias anónimo del voluntario y motivo.

## 5. Acceso, navegación y campañas

### Login y registro

- Pantallas sencillas y coherentes con el dashboard.
- Añade botones claramente marcados **“Entrar como admin · Solo mock”** y **“Entrar como coord · Solo mock”**; cada uno activa el rol exacto y el rol solo cambia desde el acceso.
- Añade registro visual simulado. No crea cuentas.
- Dentro de la app, muestra claramente el rol activo.
- `COORDINATOR` ve solo sus zonas y tiendas, en un subconjunto claramente menor; `ADMIN` ve todo.
- Ambos roles entran al mismo dashboard de campaña.

### Navegación de campaña

En contexto de campaña muestra selector de campaña, Casa, Zonas, Tiendas, Colaboradores, Incidencias, Calendario, estrella de admin solo para `ADMIN`, notificaciones, perfil y tutorial. El selector cambia el ámbito de todos los datos.

- `CONFIG.SHOW_SECTIONS_IN_NAV=false` oculta solo los enlaces de sección.
- Notificaciones bajo la campana: 2–3 ejemplos de calendario, incidencias y asignación/desasignación. Cada una abre el detalle correspondiente.
- Tutoriales paso a paso, distintos por vista, solo al pulsar el interrogante; nunca se abren automáticamente ni muestran insignias, pulsos o invitaciones.
- Perfil con ficha de contacto, ajustes visuales y cerrar sesión.
- Campaña pasada: indicador claro de solo lectura; deshabilita cambios de campaña, pero mantiene navegación y consulta.

### Administración separada

El panel de admin tiene navegación propia. Mientras se está dentro del panel:

- Oculta el selector/título de campaña, Casa, los enlaces de secciones y la campana de notificaciones de campaña.
- Sustituye la estrella por un indicador **Administración** y un enlace claro **Volver a campaña**.
- Mantén visible el rol activo y el menú de cuenta.
- No muestres el banner de solo lectura de campaña ni deshabilites acciones globales de administración por la campaña seleccionada.

## 6. Dashboard y vistas de campaña

### Inicio

En 1920×1080, sin scroll de página siempre que sea posible. El calendario va primero y ocupa el bloque protagonista; debajo, más compactos verticalmente, coloca los otros cinco bloques: Zonas, Tiendas, Colaboradores, Incidencias pendientes y Estado de la campaña. Los primeros tres bloques y Estado de la campaña enlazan a su vista correspondiente. Incidencias muestra solo pendientes y “Ver todas”.

El Estado de la campaña muestra contadores clicables sobre el ámbito visible: tiendas sin persona asignada, incidencias sin respuesta, conflictos, franjas pendientes y franjas completas. Usa los estados visuales verde/naranja/rojo, sin añadir estados nuevos.

### Zonas

- Tarjetas por defecto con conmutador a tabla. Sin mapa.
- Muestra datos útiles del modelo y el coordinador como contacto.
- Al abrir una zona, ve a Tiendas con chip de zona visible y quitable.

### Tiendas

- Tabla densa con búsqueda por tienda, cadena, localidad, zona o persona, y filtros/chips.
- Quita el botón de calendario junto al filtro.
- La columna **Turnos** muestra **solo** una etiqueta de estado: **Completo**, **Pendiente** o **Conflicto**. Nada de fracciones ni texto de mañana/tarde en esa celda. Usa verde, naranja y rojo respectivamente; Conflicto prevalece.
- Al abrir una tienda, muestra un popup casi a pantalla completa con datos clave, horarios, `STORE-MANAGER`, colaborador, turnos con estados coloreados y un calendario de tienda compacto verticalmente.
- Cada persona no voluntaria es un enlace a su ficha de contacto.

### Colaboradores

- Muestra entidades, dirección/localidad, tiendas, conteo de voluntarios y contactos.
- Añade opciones visuales para crear/modificar contactos, asignar responsable con rol `COLLABORATOR-MANAGER` y ver grupos.
- Cada grupo muestra su líder como contacto y conteo anónimo de voluntarios. Nunca nombres ni contactos del voluntariado.
- Los formularios no guardan cambios.

### Incidencias

- Lista completa con estado visible; el widget de inicio contiene solo pendientes.
- Popup con descripción y contactos pertinentes.
- Sin respuesta: caja de respuesta simulada; respondida: muestra la única respuesta y no permite otra.

## 7. Calendario de campaña

- Vistas día, semana y mes; semana por defecto. Incluye **“Volver a hoy”** en las tres vistas y en el calendario de tienda. Remarca el día actual con un círculo de fondo.
- Día y semana son líneas temporales verticales de **08:00 a 23:00**, con guías horarias visibles. Las franjas se posicionan según sus horas; el eje muestra 08:00–22:00 y el extremo 23:00.
- La campaña de muestra puede conservar dos franjas (mañana 10:00–14:00, tarde 17:00–21:00). El asistente de campañas permite franjas variables por día.
- Estados con significado fijo: fuera de campaña gris, completa verde, pendiente naranja, conflicto rojo con triángulo. Conflicto prevalece.
- Las fracciones de calendario se calculan sobre las tiendas que puede ver el usuario. El mes **no** se divide en franjas: cada día tiene un único resumen agregado. Verde si todas sus franjas están completas, naranja si queda algo pendiente, rojo si hay cualquier conflicto y gris fuera de campaña. Al pulsar el día, abre un resumen que permite consultar sus franjas.
- En la vista día añade detalle visible de lo que falta y de lo que está mal: tiendas/franjas incompletas, cuántos turnos faltan, conflictos, causa y tiendas afectadas.
- Al pulsar una franja muestra tiendas con su fracción. Orden por orden de Tiendas o por estado (completas, pendientes, conflictos). Pulsar una tienda abre el popup de tienda encima del popup anterior.
- Los popups se apilan, se cierran con Escape o clic fuera (solo el superior).
- Dos conflictos requeridos:
  1. Voluntario duplicado en dos tiendas del mismo colaborador y franja.
  2. Turno fuera del horario tras cambiar el horario de tienda.

## 8. Panel de administración

Home resumen y nav propio con las siete entidades: Tiendas, Cadenas, Colaboradores, Zonas, Auditoría, Usuarios y Campañas.

- Todas las entidades apropiadas: tabla con búsqueda, ver, editar, borrar con confirmación y crear con modal. Nunca cambies los datos reales del mockup.
- Auditoría solo lectura; indica que el modelo no contiene tabla de auditoría y que son eventos de muestra.
- Usuarios: rol editable con valores exactos. No asignes campañas o zonas desde Usuarios.
- Cadenas: desde cada cadena abre sus tiendas; allí permite ver, editar y borrar tiendas y abrir el formulario simulado para crear una tienda en esa cadena. Mantén también las acciones de crear/editar/borrar cadenas.
- Zonas: abre todas las tiendas, y desde cada zona permite marcar o desmarcar tiendas en una vista de asignación temporal.
- Colaboradores: muestra responsable, contactos y grupos/conteos sin exponer datos personales del voluntariado.

### Asistente de campaña

En Campañas debe haber **un solo botón “Crear campaña”** que abre el asistente; no dupliques “Crear” y “Emitir”. Mantén por separado la opción para crear tipos de campaña. El asistente termina en confirmación explícita y solo muestra un aviso, sin crear nada.

1. Datos básicos: nombre, tipo, fecha de inicio y fecha de fin.
2. Franjas generales: pregunta cómo suelen ser las franjas. Permite añadir, quitar y editar etiqueta, hora de inicio y fin. Usa una plantilla inicial razonable y explica que después se puede modificar cada día.
3. Calendario interactivo por días: materializa la plantilla en las fechas del rango. Muestra una semana cada vez, con navegación, eje 08:00–23:00 y franjas como eventos. Permite añadir, mover/arrastrar a otra hora o día, editar y eliminar franjas. Al hacer clic en un evento, abre un editor accesible de día, etiqueta y horas. El clic debe ser una alternativa al arrastre y funcionar con teclado. Ajusta el arrastre en intervalos de 15 minutos.
4. Tiendas: listas compactas desplegables agrupadas por cadena, con búsqueda. Se puede marcar una tienda o toda la cadena. El estado del checkbox de cadena debe ser marcado si todas están seleccionadas, indeterminado si solo algunas y desmarcado si ninguna; al quitar todas, la cadena queda automáticamente desmarcada, y al desmarcar la cadena se quitan todas sus tiendas.
5. Coordinadores:
   - Dos opciones: **Automático: reutilizar campaña anterior** o **Asignar manualmente**.
   - Automático lleva a la pantalla de asignación ya rellenada con los coordinadores de la campaña anterior. Las tiendas que no participaron antes quedan vacías.
   - Manual: asignación de coordinador `COORDINATOR` por tienda, con modo de lote por cadena o por zona.
   - Toda tienda sin coordinador tiene un triángulo visible. Si se pulsa Siguiente con faltantes, no avances: desplázate y enfoca la primera tienda sin asignar, y muestra claramente el error.
6. Confirmación final explícita.

Si se solapan franjas, muestra qué franjas y días chocan, con el intervalo de solapamiento. No permitas pasar al siguiente paso desde el calendario mientras quede algún solapamiento; lleva el foco/scroll a la primera franja afectada. Presenta los solapamientos automáticamente también cuando la plantilla general los genera.

## 9. Diseño y accesibilidad

- Escritorio, 16:9, objetivo Full HD 1920×1080; modo claro y azul primario. Diseño limpio y denso, con buena jerarquía.
- Variables CSS al inicio para paleta (incluidos cuatro estados), espaciados, radios, sombras y tipografías. Fuentes del sistema.
- Iconos SVG inline definidos en un único objeto JavaScript. Define tamaño explícito para iconos inline dentro de texto y fichas para que no se expandan.
- HTML semántico, botones para acciones y enlaces para navegación. Labels/`aria-label`, `aria-live` para avisos, alt y dimensiones de imágenes, foco visible, Escape y teclado para popups, y `prefers-reduced-motion`.
- Usa `Intl.DateTimeFormat` y `Intl.NumberFormat`. Evita scroll horizontal accidental, `transition: all`, `outline: none` sin reemplazo y datos de voluntarios en el DOM.
- Respeta `AGENTS.md` y las convenciones del repositorio. Organiza el CSS en bloques claros y fáciles de retocar.

## 10. Criterios de aceptación

- [ ] Se abre por doble clic `mockup/index.html`, sin módulos, peticiones de red ni dependencias externas.
- [ ] Login/registro simulado, ambos roles, indicador visible y ámbito diferente entre `ADMIN` y `COORDINATOR`.
- [ ] Selector de campaña, configuración `SHOW_SECTIONS_IN_NAV`, estrella solo en contexto de campaña para admin, tutoriales bajo demanda y notificaciones funcionales.
- [ ] Campaña pasada en solo lectura; navegación del panel admin separada del contexto de campaña.
- [ ] Inicio: calendario primero y cinco widgets compactos debajo.
- [ ] Zonas filtra Tiendas; tabla de tiendas densa, sin botón Calendario junto al filtro y columna Turnos solo con Completo/Pendiente/Conflicto.
- [ ] Tienda casi a pantalla completa con calendario compacto; estados coloreados en tabla y ficha.
- [ ] Calendario 08:00–23:00, vistas día/semana/mes, Hoy y círculo del día actual, calendario interactivo del asistente, edición/arrastre y validación de solapamientos.
- [ ] Month muestra un solo resumen por día, con rojo si cualquier franja está mal, verde si todas están completas, naranja si falta algo y gris fuera de campaña.
- [ ] Ninguna vista revela nombres/contactos de voluntarios; conteos y alias anónimos únicamente.
- [ ] Incidencias con una sola respuesta; contactos no voluntarios abren ficha.
- [ ] Admin separado, con las siete entidades; cadenas y zonas permiten gestionar sus tiendas; auditoría de solo lectura; roles editables; campaña con un único CTA y asistente completo.
- [ ] Crear, editar, borrar, responder, cambiar asignaciones y confirmar campaña nunca persiste datos.
- [ ] No aparece “responsable de tienda” en interfaz ni código.
- [ ] No se escribe fuera de `mockup/` al implementar esta solicitud.
