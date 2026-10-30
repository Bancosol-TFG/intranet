# ADR-0019: Autenticación con tokens de acceso y refresco

## Estado
Accepted

## Contexto
La API (ADR-0015) necesita autenticar a los usuarios de la intranet web y de la aplicación móvil PWA. Los dos clientes usan el mismo backend.

Tienen cuenta los administradores, los coordinadores, los responsables de colaborador y los líderes de grupo. Los voluntarios no tienen cuenta.

## Opciones consideradas
1. **Sesión en el servidor con cookie.**
2. **Un único JWT de larga duración.**
3. **Un token de acceso JWT de corta duración y un token de refresco con rotación.**

## Decisión
Se adopta la opción 3.

### Tokens
- **Token de acceso:**
  - es un JWT que dura 15 minutos;
  - el frontend lo guarda en memoria y lo envía en la cabecera `Authorization: Bearer`.
- **Token de refresco:**
  - es opaco y se guarda en el servidor como hash;
  - viaja en una cookie `HttpOnly`, `Secure` y `SameSite=Strict`.
- **Duración del token de refresco:** 7 días en la intranet, contados desde el último refresco, e indefinida en la PWA. Así, quien ya inició sesión en el móvil sigue dentro al empezar una campaña nueva y se evitan picos de inicios de sesión.

### Cambios de roles y permisos
- Redis guarda la fecha de la última modificación de roles o permisos.
- Cada petición compara esa fecha con la de creación del token de acceso. Es la única consulta por petición, y no toca la base de datos.
- Si el token es anterior al cambio, la API responde 401 y el cliente lo refresca, obtiene permisos actualizados y repite la petición.
- Si Redis no responde, la API acepta el token y registra el aviso: una caída de Redis no deja sin servicio a la API, y el token caduca igualmente en 15 minutos.

### Rotación y revocación
- Cada refresco genera un token de acceso y un token de refresco nuevos e invalida el anterior.
- Si se reutiliza un token de refresco ya usado, se revoca toda la sesión.
- **Se revocan las sesiones** al cerrar sesión, al cambiar la contraseña y cuando un administrador desactiva la cuenta.

### Cuentas
- Se inicia sesión con el correo electrónico.
- **Quién crea las cuentas:**
  - el administrador;
  - el responsable de colaborador, solo para los líderes de grupo de su colaborador.
- Toda cuenta nueva tiene una contraseña temporal que el usuario debe cambiar al entrar por primera vez.
- Las contraseñas tienen al menos 8 caracteres y se guardan con BCrypt.

### Permisos
- El token de acceso incluye los permisos globales del usuario.
- Los permisos sobre un recurso concreto, como una campaña o un colaborador, se comprueban en el servicio.

### Endpoints
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `GET /api/auth/me`

### Almacenamiento
- Los tokens de refresco se guardan en PostgreSQL, detrás de la interfaz `RefreshTokenStore`.
- La fecha del último cambio de permisos se guarda en Redis.

### Pendiente
- La estructura definitiva de roles y permisos de la issue #50.
- Si el responsable de colaborador puede desactivar las cuentas de sus líderes de grupo o restablecer sus contraseñas.

## Consecuencias

**Positivas:**
- Las peticiones se autentican sin consultar la base de datos; solo leen una fecha en Redis.
- Se pueden revocar sesiones y detectar tokens robados.
- La intranet y la PWA usan el mismo mecanismo.

**Negativas:**
- Las desactivaciones tardan hasta 15 minutos en aplicarse.
- Cada cambio de roles o permisos obliga a refrescar el token a todos los usuarios activos.
- Una sesión de la PWA no caduca sola: solo termina al cerrarla, al cambiar la contraseña o al revocarla.
- Redis pasa a ser un servicio necesario del despliegue.
- Si dos pestañas refrescan el token a la vez, se puede cerrar la sesión.
