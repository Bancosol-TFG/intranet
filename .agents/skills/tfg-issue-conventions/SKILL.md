---
name: tfg-issue-conventions
description: Write GitHub issues for the Bancosol intranet repository with the team's Spanish title style and the shared task template. Use whenever you create, draft, or rewrite an issue in this repository.
---

# Issue conventions

An issue describes one piece of work that will be resolved in one branch and one pull request (see the `tfg-branch-conventions` and `tfg-pr-conventions` skills). Issues are written in Spanish and follow `.github/ISSUE_TEMPLATE/tarea.md`.

## Title

- Short and specific, in Spanish, starting with a verb in the infinitive: `Crear CRUD de zonas`, `Añadir acta de reunión del 12 de octubre`.
- No type prefix such as `feat:`; the type goes in the branch and the pull request.
- Avoid titles of a single noun, such as `Zonas` or `Campaña`, that do not say what has to be done.

## Body

Use the template sections, in this order:

```markdown
## Resultado

<Qué se consigue al terminar la tarea, en una o dos frases.>

## Alcance

- <Cambio que incluye la tarea.>

## Criterios de aceptación

- [ ] <Condición comprobable para dar la tarea por terminada.>

## Notas

<Opcional: dependencias, referencias, preguntas abiertas o fuera de alcance.>
```

- Acceptance criteria must be verifiable. They become the **Validación** section of the pull request.
- Write only what is agreed. Mark open questions as pending in **Notas** instead of presenting them as decisions.
- Reference related issues, meeting notes, or ADRs with links or `#<número>`.

## Organization

- An issue can stand on its own. Group issues as sub-issues of a larger one only when the work really needs it, such as a module split into several tasks.
- Keep each issue small enough for one pull request. If it is not, split it into several issues.
- Assign the issue to its owner when it is known.

## Creating issues

- Search for duplicates first: `gh issue list --state all --search "<palabras clave>"`.
- Show the user the title and body and wait for confirmation before publishing; issues are visible to the whole team.
- Create it with the template content:

  ```sh
  gh issue create --title "<título>" --body-file <archivo> --assignee <usuario>
  ```
