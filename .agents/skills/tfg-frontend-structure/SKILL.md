---
name: tfg-frontend-structure
description: Organize the Bancosol intranet frontend by feature, including shared code and API access. Use when creating, changing, or reorganizing frontend features, components, or API integrations in this repository.
---

# Frontend structure

Organize the frontend by feature, following the modular approach agreed for the backend in `docs/adr/0016-estructura-modular-del-backend.md`. Keep related code together so that the team and AI tools can find and understand the context needed for a change.

## Feature modules

- Give each feature its own folder, such as `campaigns` or `stores`. Keep its pages, components, API operations, and feature-specific types together. Separate responsibilities within the feature when useful.
- Make dependencies between features explicit and avoid circular dependencies. Reuse existing logic instead of duplicating it.
- Create folders, layers, and abstractions when they meet a concrete need; do not create empty structures in advance. Respect the existing framework's routing and organization conventions.

## Shared code and API

- Keep a common API client in the shared area for request configuration and behavior used across features. Keep domain-specific operations inside their feature and have them use that client; do not collect all domain operations in one file.
- Reserve the shared area for code actually used by multiple features. Do not move code there solely for hypothetical future reuse, and do not duplicate shared logic.
- Align the client and interface with the project's authentication and permission decisions. Do not assume an undecided credential mechanism, token storage method, or registration flow. The interface may adapt what it displays to permissions, but authorization must be checked by the backend.

## File size and responsibilities

- Split files when they have different responsibilities or when doing so improves comprehension and review. Avoid files that mix many responsibilities and fragmentation into tiny files that makes the code harder to follow.
- Do not enforce a fixed line limit. Keep each change and its dependencies understandable to both a person and an AI model.

## Example

```text
src/
├── app/                  # Application configuration and composition
├── features/
│   ├── campaigns/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── types.ts
│   └── stores/
└── shared/
    ├── api/              # Common client
    └── components/       # Components actually shared
```

This illustrates responsibilities; it is not a required template or a reason to create empty directories. Adapt paths to the framework and existing structure while preserving the modular approach.

## Team conventions

- Follow the shared domain modules in `AGENTS.md`. Compose pages from feature-specific components when this improves clarity; keep components used by several features in the shared area.
- Group related queries and mutations in feature hooks, using separate hooks for distinct groups within a module. Keep API calls in domain API objects with consistent `list`, `create`, `update`, and `delete` names where applicable.
- Put feature-specific types in their feature and tests alongside the code they exercise. Reuse another feature's API or hook instead of duplicating its requests, while avoiding circular dependencies.
- Name component and page files with PascalCase, hook files with `use` and camelCase, and API files in camelCase. Name tests after the file under test. Respect framework-specific route naming.
- Keep feature-specific styles near the feature and genuinely global or shared styles in a common location. Choose CSS techniques consistent with the existing project.
- Preserve useful error information in the common client; allow features to interpret errors when an operation needs a specific message, with a general fallback for unexpected errors.
