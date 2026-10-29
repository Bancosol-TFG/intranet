# ADR-0019: Autenticación con tokens de acceso y refresco

## Estado
Proposed

## Contexto
La API (ADR-0015) necesita autenticar a los usuarios de la intranet web y de la aplicación móvil PWA. Los dos clientes usan el mismo backend.

Tienen cuenta los administradores, los coordinadores, los responsables de colaborador y los líderes de grupo. Los voluntarios no tienen cuenta.

## Opciones consideradas
1. **Sesión en el servidor con cookie.**
2. **Un único JWT de larga duración.**
3. **Un token de acceso JWT de corta duración y un token de refresco con rotación.**

## Decisión
Se propone la opción 3.

### Tokens
- **Token de acceso:**
  - es un JWT que dura 15 minutos;
  - el frontend lo guarda en memoria y lo envía en la cabecera `Authorization: Bearer`.
- **Token de refresco:**
  - es opaco y se guarda en el servidor como hash;
  - viaja en una cookie `HttpOnly`, `Secure` y `SameSite=Strict`.
- **Duración del token de refresco:** 7 días en la intranet y 30 en la PWA, contados desde el último refresco.

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
- Si se adopta Redis, solo cambia la implementación de esa interfaz.

### Pendiente
- La estructura de roles y permisos de la issue #50.
- Si el responsable de colaborador puede desactivar las cuentas de sus líderes de grupo o restablecer sus contraseñas.
- Si se usará Redis.

## Consecuencias

**Positivas:**
- Las peticiones se autentican sin consultar la base de datos.
- Se pueden revocar sesiones y detectar tokens robados.
- La intranet y la PWA usan el mismo mecanismo.

**Negativas:**
- Los cambios de permisos y las desactivaciones tardan hasta 15 minutos en aplicarse.
- Si dos pestañas refrescan el token a la vez, se puede cerrar la sesión.
