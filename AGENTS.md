# AGENTS.md

Shared instructions for the project's AI agents (Claude Code, Codex, and OpenCode).

## Project

Bancosol intranet, developed as a final degree project (TFG). The repository contains:

- `api/`: Spring Boot backend (JPA, Flyway, Security, Redis) on PostgreSQL.
- `frontend/`: SPA with React, TypeScript, Vite, TanStack Router, and TanStack Query. Uses `pnpm`.
- `docs/`: project documentation with Zensical, including meeting notes.
- `compose.yml`: local development environment.

## Commands

- Full environment: `docker compose up --build` from the repository root.
- Backend tests: `docker compose run --rm app bash ./mvnw test` from the repository root. The tests start the full Spring context, so they need PostgreSQL and the `DB_*` variables from `.env`; Compose provides both. Running `./mvnw test` directly on the host fails without them. The tests run Flyway against the local development database.
- Frontend, from `frontend/`: `pnpm check` (format and lint), `pnpm test`, and `pnpm build`.
- Documentation: `make docs-serve` or `make docs-build`.

## Rules

- AI supports implementation. The team makes design and architecture decisions, and every change goes through human review.
- Language:
  - **Spanish** for everything the team reads: documentation in `docs/` and `README.md` files, meeting notes, ADRs, issues, pull requests, and commit summaries.
  - **English** for code, identifiers, and the agent configuration (`AGENTS.md` and the skills).
  - Skills are written in English, but the content they produce for the team must be in Spanish.
- Open pull requests against `dev`.
- Do not edit `.env`, `frontend/src/routeTree.gen.ts`, or `volumes/`.
- Before proposing an architecture change, check the ADRs in `docs/adr/`. If a decision on architecture or technology is needed, ask the team first and record it as an ADR. Do not decide it silently in code.
- Deliver each feature complete in one pull request: backend, frontend, tests, and documentation.
- Tests must check real behavior. Do not write tests that always pass.
- Every endpoint declares the roles allowed to use it. If the roles are not specified, ask before implementing.
- Update the documentation together with the code. If a change alters commands, configuration, environment variables, ports, conventions, the data model, or a recorded decision, update `docs/` (or `model.dbml`, a `README.md`, or the related ADR) in the same pull request. Follow the `tfg-project-docs` skill.

## Code

- Identifiers and code in English. Do not write comments; names must explain the code.
- Constants in `UPPER_SNAKE_CASE`, at the top of the file, right below the imports.
- `camelCase` for functions and variables, with descriptive names. Do not use one-letter names.
- Keep functions short, reusable, and with a single clear responsibility.
- Keep the code of the three developers consistent with each other.

## Modules

- Shared domain modules: `Users`, `Auth`, `Collaborator`, `Shops`, `Campaigns`, `Logs`, `Territory`, `Turns`, `Auditory`, `Notifications`, `Reports`. Backend, frontend, and the mobile app share these concepts.
- Each backend module uses the layers `Controller`, `DTO`, `Entity`, `Exception`, `Repository`, and `Service`.
- Ask for human validation before creating a new folder or module.

## Skills

The project skills live in `.agents/skills/`. `.claude/skills` is a symbolic link to that folder so that Claude Code loads them; always create or edit skills in `.agents/skills/`.

## Workflow and commits

A single task may require multiple commits. Before staging any changes or creating each commit, you must ask for explicit human approval.

If the response is "yes", stage the relevant changes, create the commit, and proceed with the next part of the task.

Otherwise, do not stage or commit anything. Continue implementing the requested changes without committing, and ask for approval again once the work is completed.

This approval process must be repeated independently before every commit. Never stage or create a commit without explicit human approval.
