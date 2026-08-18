# Frontend Architecture

## Architectural choice

The project uses a **Feature-Based Frontend Architecture**, with explicit separation between:

1. Application/platform code
2. Business features
3. Shared infrastructure
4. Shared business logic for future Web/Mobile reuse

The architecture is intentionally simpler than full Domain-Driven Design or a heavily layered enterprise frontend.

## Current Web architecture

```text
src/
├── app/
├── routes/
├── layouts/
├── components/
├── features/
├── lib/
├── stores/
├── types/
├── utils/
└── constants/
```

## Future Web + Mobile architecture

When Mobile development begins, the project may evolve into:

```text
apps/
├── web/
│   └── src/
│       ├── app/
│       ├── routes/
│       ├── layouts/
│       ├── components/
│       └── features/
│
└── mobile/
    └── src/
        ├── navigation/
        ├── components/
        └── features/

packages/
├── api/
├── types/
├── validation/
├── domain/
├── utils/
└── config/
```

Do not introduce a monorepo before Mobile actually needs shared packages unless there is a concrete reason.

## Architectural layers

```text
Web UI / Mobile UI
        ↓
Feature UI + feature hooks
        ↓
Query / Mutation
        ↓
API client
        ↓
Spring Boot REST API
        ↓
PostgreSQL
```

Shared packages sit below the application-specific UI:

```text
Web UI ─────┐
            ├── Shared API / Types / Validation / Domain Logic
Mobile UI ──┘
                     ↓
              Spring Boot API
```

## Dependency rules

Allowed direction:

```text
app/routes/layouts
        ↓
features
        ↓
lib / shared infrastructure
        ↓
external libraries
```

Features may use shared infrastructure.

Shared infrastructure must not import feature UI.

A feature must not import another feature's private internals unless a documented shared contract exists.

Prefer:

```text
feature A → shared package
feature B → shared package
```

over:

```text
feature A → feature B internal component
```

## Feature boundary

A feature owns business-specific UI and logic.

Example:

```text
features/question-bank/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── types/
├── services/
└── utils/
```

Not every feature needs every folder.

Create a folder only when it contains meaningful code.

## Avoid

- Global `services/` containing every business operation
- Global `hooks/` containing feature-specific hooks
- Global `types/` containing every domain type
- A giant Redux store for all application data
- Generic abstractions created before duplication exists
- Cross-feature imports that bypass public boundaries
