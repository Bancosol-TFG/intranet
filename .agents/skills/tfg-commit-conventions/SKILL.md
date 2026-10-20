---
name: tfg-commit-conventions
description: Write commit messages for the Bancosol intranet repository with Conventional Commits, an English type and scope, and a Spanish summary. Use whenever you create, amend, or propose a commit in this repository.
---

# Commit conventions

## Format

```text
<type>(<scope>): <resumen en español>

[optional body in Spanish]

[optional footer]
```

- **Type** (required, English, lowercase): `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`, or `style`.
- **Scope** (English, lowercase): the area touched. Always include one when it fits. Current scopes: `frontend`, `api`, `db`, `docs`, `ci`, `ia` (agent configuration: `AGENTS.md`, skills, and AI setup). Omit it only when the change spans several areas with no single fit.
- **Summary** (required, Spanish): starts with a verb in the infinitive and in lowercase, has no final period, and stays under about 72 characters.
- **Body** (optional, Spanish): explain why, not what, when the summary is not enough. Wrap at about 72 characters.
- **Footer** (optional): `BREAKING CHANGE: <descripción>` for incompatible changes. Issue references belong in the pull request, not in each commit.

## Rules

- Make small commits with a single purpose. Pull requests are integrated with a merge commit, not squashed, so every commit stays in the history of `dev` and must be understandable on its own.
- Do not mix formatting changes with functional changes in the same commit.
- Do not commit `.env`, generated files such as `frontend/src/routeTree.gen.ts`, or contents of `volumes/`.
- The frontend `pre-commit` hook runs Oxfmt and Oxlint; fix the reported problems instead of skipping the hook.

## Examples

```text
feat(frontend): integrar TanStack Router y Query
fix(frontend): configurar Husky de forma multiplataforma
feat(db): añadir la migración inicial de cadenas
docs(db): explicar la convención de nombres de flyway
ci(docs): desplegar Pages desde dev
chore(frontend): ignorar temporales de TanStack
```

Avoid messages without a type or with a vague summary, such as `fix: problema de permisos`, `modelo base`, or `add: base documentacion proyecto`.
