---
name: tfg-pr-review
description: Review a diff or pull request in the Bancosol intranet repository against its issue, the project conventions, documentation, and checks before human review. Use when the user asks for a review, or before marking a pull request as ready.
---

# Code review

This review is a filter before human review, not a replacement for it. Every pull request still needs the approval of the other two team members.

## Scope

Review what the user asks for. If they do not say, review the current branch against `origin/dev`:

```sh
git fetch origin
git diff origin/dev...HEAD --stat
git diff origin/dev...HEAD
git log --oneline origin/dev..HEAD
```

For a pull request, use `gh pr view <número>` and `gh pr diff <número>`. Read the linked issue (`Closes #<número>`) with `gh issue view <número>`.

Read the full files around the changed lines when the diff alone is not enough to judge them.

## Checklist

### Correctness and scope

- The change does what the issue describes and meets each acceptance criterion.
- There are no unrelated changes. Larger out-of-scope work belongs in another issue.
- Edge cases, error handling, and data rules are covered, such as required fields, ranges, and permissions.
- No secrets, credentials, or personal data are added.

### Conventions

- Commits follow the `tfg-commit-conventions` skill and each has a single purpose.
- The branch follows the `tfg-branch-conventions` skill.
- The pull request title and description follow the `tfg-pr-conventions` skill.
- Migrations follow the `tfg-flyway-migration` skill: the name and version are correct, no merged migration is edited, the version is newer than the latest in `origin/dev`, and the JPA entities match.
- The code follows the agreed conventions: `camelCase` variables, `UPPER_SNAKE_CASE` constants, plural REST endpoints and tables, singular entities, and a modular backend.
- `.env`, `frontend/src/routeTree.gen.ts`, `volumes/`, and build output are not committed.
- `.claude/skills` is still a symbolic link to `../.agents/skills`, and no skill is duplicated outside `.agents/skills/`. Check it with:

  ```sh
  git ls-tree -r HEAD -- .claude/skills
  ```

  It must show a single entry, `.claude/skills`, with mode `120000`. Otherwise, report it as **Bloqueante**: the branch must restore the link (`git checkout origin/dev -- .claude/skills` after removing the copied folder). Also tell the author that their clone does not support symbolic links, probably on Windows, and suggest this fix so it does not happen again:

  ```sh
  git config core.symlinks true
  git checkout -- .claude/skills
  ```

  On Windows, this requires Developer Mode or an administrator terminal.

### Design

- The code is simple and readable, with no duplicated logic and no dead code.
- Changes to architecture or durable decisions match the ADRs in `docs/adr/`. If a change contradicts an ADR, flag it for the team instead of accepting it.

### Tests and checks

- New behavior has tests when the affected part has a test setup.
- Run the checks of the affected parts and report the real result:

  ```sh
  docker compose run --rm app bash ./mvnw test   # needs PostgreSQL; see AGENTS.md
  (cd frontend && pnpm check && pnpm test && pnpm build)
  make docs-build
  git diff --check
  ```

  If a check cannot run, say so and explain why.

### Documentation

- The documentation is updated in the same pull request when the change alters commands, configuration, environment variables, ports, conventions, the data model, or a recorded decision. Check `docs/`, the `README.md` files, `model.dbml`, and the ADRs, following the `tfg-project-docs` skill.

## Report

Write the report in Spanish. List the findings from most to least severe, each with:

- its severity: **Bloqueante** (it must be fixed before merging), **Importante** (it should be fixed), or **Sugerencia** (optional);
- the file and line, as `ruta:línea`;
- the problem and a concrete fix.

End with the checks you ran and their results, and a verdict: **Lista para revisión humana** or **Necesita cambios**.

Do not modify the code during the review unless the user asks for it. Do not approve, merge, or comment on GitHub on behalf of the user unless they ask for it.
