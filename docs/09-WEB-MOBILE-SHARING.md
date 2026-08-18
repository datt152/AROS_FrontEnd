# Web → Mobile Shared Code Strategy

## Goal

Reuse business logic without forcing Web UI architecture onto React Native.

## Share

Prefer sharing:

```text
API client
API contracts/types
Validation schemas
Domain/business functions
Constants
Pure utilities
Authentication logic where platform-compatible
```

## Do not share by default

Avoid sharing:

```text
HTML
CSS
Web-specific components
React Router
Browser APIs
Web table implementations
Web layouts
Web-specific state/UI abstractions
```

## Architecture

```text
                Shared Core
        ┌──────────┼──────────┐
        │          │          │
       API       Types    Validation
        │          │          │
        └──────────┼──────────┘
                   │
             Domain Logic
             /                     Web             Mobile
        React          React Native
```

## Feature principle

Web and Mobile can have different feature implementations.

Example:

```text
Web:
features/exam/
  ExamListPage
  ExamEditor
  ExamQuestionSelector

Mobile:
features/exam/
  ExamListScreen
  TakingExamScreen
  ResultScreen
```

They can share:

```text
packages/
├── api/
├── types/
├── validation/
└── domain/
```

## Mobile scope

Mobile supports Teacher and Student but only selected high-value functions.

Do not force Mobile to implement every Web feature.

## Monorepo decision

Use a monorepo when Mobile begins and there is real shared-code value.

Possible structure:

```text
apps/
├── web/
└── mobile/

packages/
├── api/
├── types/
├── validation/
├── domain/
├── utils/
└── config/
```

A monorepo is an organizational tool, not an architectural goal.

Do not introduce Turborepo/pnpm workspace/etc. solely to appear production-grade before the need exists.
