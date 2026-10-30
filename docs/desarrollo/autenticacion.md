# Autenticación

La API autentica con un token de acceso JWT de 15 minutos y un token de refresco en una cookie `HttpOnly`, según el [ADR-0019](../adr/0019-autenticacion-con-tokens-de-acceso-y-refresco.md).

## Endpoints

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `POST /auth/login` | Público | Inicia sesión con `email`, `password` y `client` (`WEB` o `MOBILE`). |
| `POST /auth/refresh` | Cookie de refresco | Rota el token de refresco y devuelve un token de acceso nuevo. |
| `POST /auth/logout` | Público | Revoca la sesión de la cookie. |
| `POST /auth/change-password` | Autenticado | Cambia la contraseña y revoca todas las sesiones. |
| `GET /auth/me` | Autenticado | Devuelve el usuario actual. |
| `POST /users` | Permiso `users:create` | Crea una cuenta y devuelve una sola vez su contraseña temporal. |

El resto de endpoints exige un token válido (401). Las restricciones por rol de cada módulo llegarán con la issue #50.

Mientras una cuenta tenga la contraseña temporal, solo puede usar `/auth/*`; el resto responde 403.

## Primer administrador

Si `ADMIN_EMAIL` y `ADMIN_PASSWORD` están definidas, la API crea esa cuenta al arrancar con el rol `ADMIN`, salvo que el correo ya exista. Debe cambiar la contraseña al entrar.

## Cambios de roles y permisos

El código que modifique roles o permisos debe llamar a `PermissionChangeTracker.markChanged()`. Los tokens de acceso anteriores a ese momento reciben 401 y el cliente los renueva.

## Frontend

`frontend/src/shared/api/client.ts` añade el token a cada petición. Ante un 401 renueva la sesión una sola vez, aunque fallen varias peticiones a la vez, y repite la petición. Si no puede renovarla, redirige a `/login`.

La cookie es `Secure`: en desarrollo funciona en `localhost`, pero no en otro host servido por HTTP.
