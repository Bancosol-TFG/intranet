# Desarrollo con IA

El proyecto incluye una configuración compartida para trabajar con agentes de IA
desde Claude Code, Codex y OpenCode. Recoge el contexto del proyecto y las
convenciones del equipo para que los tres agentes trabajen de la misma forma.

La IA es un apoyo a la implementación: el equipo toma las decisiones de diseño y
arquitectura, y todo cambio pasa por la revisión de los otros dos integrantes.

## Estructura

```text
AGENTS.md                    Instrucciones globales para los agentes
.agents/skills/              Skills del proyecto (ubicación canónica)
.claude/skills/              Enlace simbólico a .agents/skills para Claude Code
.github/ISSUE_TEMPLATE/      Plantilla de issues
```

| Herramienta | Instrucciones | Skills |
| --- | --- | --- |
| Claude Code | `AGENTS.md` | `.claude/skills/` (enlace a `.agents/skills/`) |
| Codex | `AGENTS.md` | `.agents/skills/` |
| OpenCode | `AGENTS.md` | `.agents/skills/` |

`AGENTS.md` contiene la descripción del proyecto, los comandos de comprobación y
las reglas generales. Cada herramienta lo carga automáticamente al trabajar en el
repositorio.

Una skill es una carpeta con un `SKILL.md` que explica al agente cómo hacer una
tarea concreta. El agente la carga cuando la tarea encaja con su descripción, o
cuando se pide por su nombre (por ejemplo, `/tfg-pr-review` en Claude Code o
`$tfg-pr-review` en Codex).

## Idioma

- `AGENTS.md` y las skills están en inglés.
- Todo lo que lee el equipo se escribe en español: la documentación, las notas
  de reunión, los ADR, las issues, las pull requests y los resúmenes de commit.
- El código y sus identificadores, en inglés.

## Skills disponibles

| Skill | Para qué sirve |
| --- | --- |
| `tfg-issue-conventions` | Redactar issues con la plantilla del repositorio. |
| `tfg-branch-conventions` | Crear ramas `<tipo>/<número>-<descripcion>` desde `dev`. |
| `tfg-commit-conventions` | Escribir commits `<tipo>(<ámbito>): <resumen en español>`. |
| `tfg-pr-conventions` | Abrir pull requests contra `dev` con el formato de descripción común. |
| `tfg-pr-review` | Revisar un cambio antes de pedir la revisión del equipo. |
| `tfg-flyway-migration` | Crear migraciones de base de datos con Flyway. |
| `tfg-project-docs` | Editar, validar y desplegar esta documentación. |
| `tfg-meeting-notes` | Convertir la transcripción de una reunión en una nota. |

## Flujo de trabajo

1. **Issue.** Cada trabajo empieza con una issue que sigue la plantilla
   `Tarea`: resultado, alcance, criterios de aceptación y notas. Las issues
   pueden agruparse como sub-issues cuando el trabajo lo necesite, pero no es
   obligatorio.
2. **Rama.** Crea una rama desde `origin/dev` con el número de la issue, por
   ejemplo `feat/23-crud-localidades`.
3. **Implementación.** Haz commits pequeños y con un único propósito. Si el
   cambio toca la base de datos, añade una migración de Flyway.
4. **Documentación.** Actualiza la documentación en la misma pull request
   cuando el cambio altere comandos, configuración, variables, puertos,
   convenciones, el modelo de datos o una decisión registrada.
5. **Comprobaciones.** Ejecuta las comprobaciones de las partes afectadas:

    ```sh
    docker compose run --rm app bash ./mvnw test        # Backend
    (cd frontend && pnpm check && pnpm test && pnpm build)  # Frontend
    make docs-build                                     # Documentación
    ```

    Los tests del backend arrancan el contexto completo de Spring, por lo que
    necesitan PostgreSQL y las variables `DB_*` de `.env`; Compose aporta
    ambos.

6. **Revisión previa.** Pide al agente una revisión con `tfg-pr-review`.
7. **Pull request.** Abre la pull request contra `dev` con `Closes #<número>`.
   Necesita la aprobación de los otros dos integrantes y se integra con merge,
   sin squash.

## Añadir o modificar skills

- Crea o edita siempre las skills en `.agents/skills/<nombre>/SKILL.md`; el
  enlace hace que Claude Code las vea sin copiarlas.
- Usa el prefijo `tfg-` y un nombre en minúsculas y kebab-case. El prefijo evita
  conflictos con las skills personales o integradas de cada herramienta.
- El `SKILL.md` empieza con un bloque YAML con `name`, igual al nombre de la
  carpeta, y `description`, que indica qué hace y cuándo usarla.
- Las convenciones nuevas o los cambios de convención se acuerdan con el equipo
  antes de añadirlos a una skill.

## Windows

`.claude/skills` es un enlace simbólico. En Windows, Git solo lo crea si los
enlaces simbólicos están habilitados: activa el Modo de desarrollador de Windows
(o usa una terminal de administrador) y clona con:

```sh
git clone -c core.symlinks=true <url>
```

Sin esa opción, Git crea en su lugar un fichero de texto con la ruta
`../.agents/skills`. Git no lo detecta como un cambio, pero Claude Code no
encontrará las skills; Codex y OpenCode no se ven afectados.

Si ya has clonado sin la opción, arréglalo así:

```sh
git config core.symlinks true
git checkout -- .claude/skills
```

No sustituyas el fichero por una copia de la carpeta de skills: Git lo
registraría como un cambio y las skills quedarían duplicadas en el repositorio.
La revisión con `tfg-pr-review` marca como bloqueante cualquier pull request
que cambie `.claude/skills`.
