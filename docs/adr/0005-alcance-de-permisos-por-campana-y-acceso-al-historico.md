# ADR-0005: Alcance de permisos por campaña

## Estado
Accepted

## Contexto
La aplicación debe distinguir el alcance de actuación de los administradores y de los demás perfiles. En la reunión del 30 de septiembre se resumió que el administrador puede actuar sobre toda la base de datos y que, por debajo de ese rol, la actuación queda limitada a la campaña actual.

## Opciones consideradas
1. Permitir al administrador actuar sobre toda la base de datos y limitar a los demás perfiles a su campaña actual.
2. Permitir a todos los perfiles actuar sobre datos de cualquier campaña.
3. Definir un alcance global para cada perfil sin una regla común por campaña.

## Decisión
El administrador puede actuar sobre toda la base de datos. Los perfiles por debajo del administrador solo pueden actuar sobre la campaña o campañas actuales que tengan asignadas.

## Consecuencias
**Positivas:**
- Establece un límite común de autorización para los perfiles no administradores.
- Permite al administrador realizar tareas globales de gestión.

**Negativas:**
- La aplicación debe identificar las campañas actuales y las asignaciones de cada perfil.
- Los permisos concretos de lectura, modificación y consulta histórica deben detallarse en los requisitos sin ampliar este alcance por defecto.
