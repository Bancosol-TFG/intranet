---
name: tfg-pr-conventions
description: Write and open pull requests in the Bancosol intranet repository with the team's title format, Spanish description sections, issue linking, and review rules. Use whenever you create, edit, or describe a pull request in this repository.
---

# Pull request conventions

## Rules

- Open pull requests from a work branch (see the `tfg-branch-conventions` skill) against `dev`. Only `dev` is merged into `main`.
- Open the pull request as a draft while work is in progress, and mark it ready when it meets its scope and validation passes.
- A pull request needs the approval of the other two team members before it is integrated.
- Integrate with a merge commit; do not squash.
- Do not merge or approve pull requests on behalf of the user.
- Keep each pull request focused on one issue.

## Title

Use the format of the main commit, in Spanish, without the issue number:

```text
<type>(<scope>): <resumen en español>
```

Example: `feat(frontend): configurar base React con TanStack`.

## Description

Write it in Spanish with these sections, in this order:

```markdown
## Resultado

<Qué consigue la PR, en una o dos frases.>

## Alcance

- [x] <Cambio realizado.>
- Fuera de alcance: <lo que no incluye, si ayuda a la revisión.>

## Seguimiento

Closes #<número>

## Validación

- `<comando>`: correcto.
- <Comprobación manual y su resultado.>

## Riesgos y notas

<Limitaciones, comprobaciones no realizadas o pasos que debe hacer quien revise. Omite la sección si no hay nada que destacar.>
```

- Use `Closes #<número>` in **Seguimiento**: the repository's CI closes linked issues when the pull request is merged into `dev`.
- In **Validación**, list the commands you actually ran and their real results. If a check could not run, say so instead of omitting it.
- Mention configuration or documentation changes the rest of the team must know about, such as new environment variables or new commands.

## Documentation

Before opening the pull request and after every later change to it, check whether the code changes make any documentation outdated: `docs/`, `README.md` files, `model.dbml`, or ADRs. Update it in the same pull request, following the `tfg-project-docs` skill. List the updated pages in **Alcance**; if no documentation needed changes, do not add any.

## Creating it with `gh`

```sh
gh pr create --draft --base dev --title "<type>(<scope>): <resumen>" --body-file <archivo>
```
