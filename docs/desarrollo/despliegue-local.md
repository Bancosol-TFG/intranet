# Despliegue local

El archivo `compose.yml` levanta el entorno de desarrollo de la API, PostgreSQL,
Drizzle Studio y la documentación de Zensical. Los puertos publicados se pueden
abrir desde el equipo local.

## Requisitos

- Docker Engine.
- Docker Compose v2, disponible como `docker compose`.

Ejecuta los comandos de esta guía desde la raíz del repositorio, donde está
`compose.yml`.

## Configurar el entorno

Crea el archivo local de variables a partir de la plantilla:

```sh
cp .env.example .env
```

Edita `.env` y define estas variables obligatorias:

| Variable | Uso |
| --- | --- |
| `DB_NAME` | Nombre de la base de datos que crea PostgreSQL. |
| `DB_USER` | Usuario de PostgreSQL. |
| `DB_PASSWORD` | Contraseña del usuario de PostgreSQL. |
| `VITE_BACKEND_URL` | Prefijo obligatorio de las peticiones del frontend al backend, por ejemplo `/api`. |

Los puertos publicados en el equipo local son opcionales. Si no los defines,
Compose usa estos valores:

| Variable | Predeterminado | Servicio |
| --- | ---: | --- |
| `APP_PORT` | `8080` | API |
| `DB_PORT` | `5432` | PostgreSQL |
| `DOCS_PORT` | `8001` | Documentación Zensical |
| `FRONTEND_PORT` | `5173` | Frontend |

Por ejemplo, puedes cambiar `APP_PORT` o `DOCS_PORT` si esos puertos ya están
ocupados. Drizzle Studio publica el puerto `5433`, configurado directamente en
`compose.yml`.

`DB_HOST` aparece en `.env.example`, pero Compose establece `DB_HOST=postgres`
para la API. `postgres` es el nombre del servicio dentro de la red de Compose.
La API se conecta a PostgreSQL por `postgres:5432`, aunque cambies `DB_PORT`:
esa variable cambia el puerto publicado en el equipo local, no el puerto interno
del contenedor.

El archivo `.env` contiene configuración local y credenciales; mantenlo fuera
del control de versiones.

## Servicios y puertos

| Servicio | Acceso desde el equipo local | Puerto dentro de Compose |
| --- | --- | --- |
| API (`app`) | `http://localhost:${APP_PORT:-8080}` | `8080` |
| Frontend (`frontend`) | `http://localhost:${FRONTEND_PORT:-5173}` | `5173` |
| PostgreSQL (`postgres`) | `localhost:${DB_PORT:-5432}` | `5432`; otras aplicaciones de Compose usan `postgres:5432` |
| Drizzle Studio (`drizzle-studio`) | `http://localhost:5433` | `4983` |
| Documentación (`docs`) | `http://localhost:${DOCS_PORT:-8001}` | `8000` |

La API y Drizzle Studio esperan a que la comprobación de salud de PostgreSQL
indique que está listo. La documentación no depende de la base de datos.

Durante el desarrollo, Vite redirige las peticiones que empiezan por `/api` al
backend indicado en `VITE_API_PROXY_TARGET` y elimina ese prefijo antes de
reenviarlas. Compose lo configura como `http://app:8080`; si ejecutas Vite en el
equipo local, el valor predeterminado es `http://localhost:8080`. El frontend
toma el prefijo de `VITE_BACKEND_URL`, que debe estar definido de forma explícita.

## Arrancar y detener

Para construir las imágenes necesarias y arrancar los cuatro servicios en primer
plano:

```sh
docker compose up --build
```

Compose muestra los registros en la terminal. Para dejar los servicios en
segundo plano, usa:

```sh
docker compose up --build -d
docker compose ps
docker compose logs -f
```

Detén los servicios con:

```sh
docker compose down
```

## Persistencia de datos

- PostgreSQL guarda sus datos en `volumes/postgres_data/`.
- Drizzle Studio guarda su configuración en `volumes/drizzle-conf/`.

Esas carpetas están enlazadas desde el equipo local, por lo que los datos
permanecen al detener los contenedores con `docker compose down`.
