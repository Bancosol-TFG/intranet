---
name: tfg-branch-conventions
description: Name and create work branches in the Bancosol intranet repository following the team's Git flow (main, dev, and one branch per issue). Use whenever you create, rename, or propose a branch in this repository.
---

# Branch conventions

## Git flow

- `main` is protected and only receives integrations from `dev`.
- `dev` is the integration branch. Every work branch starts from the latest `origin/dev` and is merged back into `dev` through a pull request.
- Never commit directly to `main` or `dev`.

## Format

```text
<type>/<issue-number>-<descripcion-corta>
```

- **Type**: the same English types as in the `tfg-commit-conventions` skill (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`…), chosen by the main purpose of the branch.
- **Issue number**: the number of the issue the branch resolves, without `#`. Every branch must have an issue; if none exists, ask the user before creating one. Do not invent numbers.
- **Description**: a short Spanish summary in kebab-case: lowercase, hyphens, no accents, `ñ` written as `n`, and about two to five words.

## Creating the branch

```sh
git fetch origin
git switch -c <type>/<issue-number>-<descripcion-corta> origin/dev
git push -u origin <type>/<issue-number>-<descripcion-corta>
```

## Examples

```text
feat/27-configuracion-base-frontend
chore/13-configurar-migraciones
docs/15-refactor-docs-deploy-dev
docs/3-migrar-reuniones-notion
```

Avoid branches without an issue number, such as `docs/c4` or `docs/adrs-proyecto-2`, and vague descriptions such as `cambios` or `arreglos`.
