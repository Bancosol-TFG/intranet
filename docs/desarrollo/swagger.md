# Swagger UI

La API publica su especificación OpenAPI y una interfaz de Swagger UI para probar los endpoints desde el navegador.

## Acceso

| Recurso | URL en local |
| --- | --- |
| Swagger UI | `http://localhost:${APP_PORT:-8080}/swagger-ui.html` |
| Especificación OpenAPI (JSON) | `http://localhost:${APP_PORT:-8080}/v3/api-docs` |

Ambas rutas son públicas. La variable `SWAGGER_ENABLED` (por defecto `true` en `.env.example`) las activa o desactiva; con `false`, las dos responden 404.

La especificación incluye el título *Intranet Bancosol API*, la versión del `pom.xml` y el esquema de seguridad `bearerAuth` (HTTP Bearer, formato JWT). Todos los endpoints lo exigen salvo `POST /auth/login`, `POST /auth/refresh` y `POST /auth/logout`.

## Llamar a endpoints protegidos

1. Abre `POST /auth/login`, pulsa *Try it out* y envía `email`, `password` y `client` (`WEB`). Copia el `accessToken` de la respuesta.
2. Pulsa *Authorize*, pega el token (sin el prefijo `Bearer`) y confirma. Swagger UI lo guarda y lo mantiene al recargar la página.
3. Llama a cualquier endpoint protegido, por ejemplo `GET /auth/me`.

Sin token, los endpoints protegidos responden 401.

### Contraseña temporal

Si la cuenta tiene una contraseña temporal, como el administrador inicial de [Autenticación](autenticacion.md#primer-administrador), el resto de endpoints responde 403. Autoriza con el token, llama a `POST /auth/change-password` y repite el login con la contraseña nueva: el cambio revoca todas las sesiones.

### Caducidad

El token de acceso caduca a los 15 minutos y entonces la API responde 401. Llama a `POST /auth/refresh`, que usa la cookie de refresco del login, y vuelve a autorizar con el `accessToken` nuevo. La cookie es `Secure`, así que el navegador solo la envía en `localhost` o con HTTPS.

El token autorizado se guarda en el `localStorage` del navegador. Es aceptable en desarrollo; en otros entornos conviene desactivar Swagger con `SWAGGER_ENABLED=false`.
