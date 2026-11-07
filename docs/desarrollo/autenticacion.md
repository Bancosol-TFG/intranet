# Autenticación

La API autentica con un token de acceso JWT de 15 minutos y un token de refresco en una cookie `HttpOnly`, según el [ADR-0019](../adr/0019-autenticacion-con-tokens-de-acceso-y-refresco.md).

## Endpoints

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `POST /auth/login` | `@Public` | Inicia sesión con `email`, `password` y `client` (`WEB` o `MOBILE`). |
| `POST /auth/refresh` | `@Public` y cookie de refresco | Rota el token de refresco y devuelve un token de acceso nuevo. |
| `POST /auth/logout` | `@Public` | Revoca la sesión de la cookie. |
| `POST /auth/change-password` | `@RequiresAuthentication` | Cambia la contraseña y revoca todas las sesiones. |
| `GET /auth/me` | `@RequiresAuthentication` | Devuelve el usuario actual. |
| `POST /users` | `@RequiresAuthentication` y permiso `users:create` | Crea una cuenta y devuelve una sola vez su contraseña temporal. |

Cada método de endpoint en un controller debe declarar exactamente una anotación de acceso: `@Public`, `@RequiresAuthentication` o `@RequiresPermission`. La compilación falla si falta la anotación, se usan varias o se coloca una fuera de un controller. En ejecución, la API también deniega con 403 los endpoints sin una declaración válida.

`@Public` permite peticiones sin autenticación. `@RequiresAuthentication` exige una sesión autenticada. `@RequiresPermission` exige la authority exacta indicada en el catálogo `PermissionCode`; sin token la API responde 401 y sin permiso responde 403.

Mientras una cuenta tenga la contraseña temporal, solo puede usar `/auth/*`; el resto responde 403.

Para probar estos endpoints desde el navegador, consulta [Swagger UI](swagger.md).

## Primer administrador

Si `ADMIN_EMAIL` y `ADMIN_PASSWORD` están definidas, la API crea esa cuenta al arrancar con el rol `ADMIN`, salvo que el correo ya exista. Debe cambiar la contraseña al entrar.

`.env.example` define `admin@bancosol.com` con la contraseña `admin`, así que al copiarlo a `.env` esa es la cuenta de desarrollo. Al entrar por primera vez hay que cambiar la contraseña por otra de al menos 8 caracteres.

La cuenta solo se crea si el correo no existe: cambiar estas variables después no modifica una cuenta existente. Son credenciales solo para desarrollo; fuera de ese entorno hay que usar otras o dejarlas vacías.

## Cambios de roles y permisos

El código que modifique roles o permisos debe llamar a `PermissionChangeTracker.markChanged()`. Los tokens de acceso anteriores a ese momento reciben 401 y el cliente los renueva.

## Frontend

`frontend/src/shared/api/client.ts` añade el token a cada petición. Ante un 401 renueva la sesión una sola vez, aunque fallen varias peticiones a la vez, y repite la petición. Si no puede renovarla, redirige a `/login`.

La cookie es `Secure`: en desarrollo funciona en `localhost`, pero no en otro host servido por HTTP.
