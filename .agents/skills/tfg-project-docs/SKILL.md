---
name: tfg-project-docs
description: Create, edit, preview, and publish the Bancosol intranet documentation in docs/ (Zensical site deployed to GitHub Pages). Use whenever a task adds or changes documentation, setup or usage instructions, ADRs, or meeting notes, or touches zensical.toml, requirements-docs.txt, or the docs deployment.
---

# Project documentation

The project documentation is a [Zensical](https://zensical.org/) site written in Markdown in `docs/` and published at <https://bancosol-tfg.github.io/intranet/>.

## Contents

| Path | Contents |
| --- | --- |
| `docs/index.md` | Home page and index of the main pages. |
| `docs/desarrollo/` | Developer guides: local deployment (`despliegue-local.md`), database migrations (`migraciones.md`), and other setup or usage guides. |
| `docs/reuniones/` | One dated note per meeting, `nota-reunion-YYYY-MM-DD.md`. Create them with the `tfg-meeting-notes` skill. |
| `docs/adr/` | Architecture decision records, `NNNN-titulo-en-kebab-case.md`, based on `docs/adr/0000-template.md`. |
| `docs/assets/` | Site CSS (`stylesheets/extra.css`) and JavaScript (`javascripts/shortcuts.js`). Change them only for presentation issues. |
| `zensical.toml` | Site configuration: name, theme, palette, extra assets, and `docs_dir`/`site_dir`. |
| `requirements-docs.txt` | Pinned Zensical version, shared by local builds, Docker, and CI. |

The site navigation is generated from the folder structure; `zensical.toml` defines no explicit `nav`. When you add a main page, also link it from `docs/index.md`.

## What to document

- Confirmed behavior, setup, commands, and usage that the team needs to work, such as new environment variables, services, ports, or workflows.
- Durable technical decisions, as ADRs. Check the existing ADRs first and mark a replaced ADR as `Superseded` instead of rewriting its decision.
- Do not document proposals as agreements. Mark open questions as pending, as the meeting notes and ADRs do.
- Do not duplicate content: link to the existing page and update it.

## Writing style

- Write in Spanish, with short, direct sentences and a neutral, second-person tone for instructions (`Crea`, `Ejecuta`, `Comprueba`).
- Use file and folder names in lowercase kebab-case. Meeting notes and ADRs follow their own naming formats.
- Start each page with a single `#` title, and use `##` and `###` for sections.
- Put commands, paths, variables, and identifiers in backticks, and command blocks in fenced code blocks with a language (`sh`, `text`, `yaml`…).
- Use tables for variables, ports, and services, and numbered lists for ordered steps.
- Use relative links between pages, such as `[Migraciones](desarrollo/migraciones.md)`.
- Keep the docs in sync with the code: when a change alters a command, port, variable, or convention, update the page in the same pull request.

### ADR format

Copy `docs/adr/0000-template.md` and use the next free number. Keep its sections in order: `## Estado` (`Proposed`, `Accepted`, `Rejected`, `Deprecated`, or `Superseded`), `## Contexto`, `## Opciones consideradas`, `## Decisión` («Pendiente de decisión» if there is no agreement), and `## Consecuencias` with **Positivas:** and **Negativas:**.

## Preview locally

Use either option from the repository root:

```sh
make docs-serve        # Python virtual environment in .venv-docs, live reload
docker compose up docs # Container, at http://localhost:${DOCS_PORT:-8001}
```

## Validate

Before opening the pull request, build the site and fix every warning:

```sh
make docs-build   # Generates build/docs/ with --clean
git diff --check
```

`build/` and `.venv-docs/` are ignored; never commit them. `make docs-clean` removes the generated site.

## Deployment

The `.github/workflows/docs-pages.yml` workflow publishes the site to GitHub Pages:

- It runs automatically on every push to `dev` that changes `docs/**`, `requirements-docs.txt`, `zensical.toml`, or the workflow itself. Merging a documentation pull request into `dev` therefore publishes it.
- It installs `requirements-docs.txt`, runs `python -m zensical build --config-file zensical.toml --clean`, and deploys `build/docs`.
- To redeploy without changes, for example after a failed run, run it manually:

  ```sh
  gh workflow run docs-pages.yml --ref dev
  gh run watch
  ```

- Never deploy from a work branch or publish the site by hand.

## Changing the configuration

- To update Zensical, change the pinned version in `requirements-docs.txt`. Local builds, `Dockerfile.docs`, and CI all use that file. Verify with `make docs-build` and `docker compose up --build docs`.
- If you change `docs_dir` or `site_dir` in `zensical.toml`, also update the `Makefile`, the upload path in the workflow, and `.gitignore`.
