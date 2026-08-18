# Folder Structure

## Web

```text
src/
├── app/
│   ├── App.tsx
│   └── providers/
│
├── routes/
│   ├── index.tsx
│   ├── ProtectedRoute.tsx
│   └── RoleRoute.tsx
│
├── layouts/
│   ├── AuthLayout.tsx
│   ├── TeacherLayout.tsx
│   └── StudentLayout.tsx
│
├── components/
│   ├── ui/
│   └── common/
│
├── features/
│   ├── auth/
│   ├── classroom/
│   ├── student/
│   ├── subject/
│   ├── question-bank/
│   ├── exam/
│   ├── omr/
│   └── result/
│
├── lib/
│   ├── axios.ts
│   └── queryClient.ts
│
├── stores/
├── types/
├── utils/
└── constants/
```

## Feature structure

Example:

```text
features/exam/
├── api/
│   └── exam.api.ts
├── components/
│   ├── ExamForm.tsx
│   ├── ExamList.tsx
│   └── ExamQuestionSelector.tsx
├── hooks/
│   └── useExam.ts
├── pages/
│   ├── ExamListPage.tsx
│   ├── CreateExamPage.tsx
│   └── EditExamPage.tsx
├── schemas/
│   └── exam.schema.ts
├── types/
│   └── exam.types.ts
├── services/
│   └── exam.service.ts
└── utils/
    └── exam.utils.ts
```

Folders are optional. Do not create empty folders.

## Responsibilities

### `app/`
Application bootstrap and providers.

May contain:
- React application root
- Query provider
- authentication provider if genuinely needed
- global configuration

Must not contain feature business logic.

### `routes/`
URL-to-page mapping and route guards.

Must not contain API calls or complex business logic.

### `layouts/`
Structural page shells.

Examples:
- sidebar
- header
- navigation
- outlet

Must not contain feature-specific API workflows.

### `components/ui/`
Reusable visual primitives.

Examples:
- Button
- Input
- Dialog
- Modal
- Toast
- Loading
- EmptyState

Must be business-agnostic.

### `components/common/`
Reusable application-level components that are not pure primitives.

Examples:
- PageHeader
- DataTable wrapper
- ErrorBoundary

Do not put QuestionTable or ExamForm here.

### `features/`
Business-specific functionality.

### `lib/`
Infrastructure integrations and configuration.

Examples:
- Axios instance
- Query client
- date library configuration

### `stores/`
Only genuinely shared client-side global state.

Do not place server state here.

### `types/`
Only types genuinely shared across multiple features. Feature-specific types stay inside the feature.

### `utils/`
Pure, reusable utilities that are not domain-specific.

Domain-specific utilities belong to their feature or shared domain package.

### `constants/`
Global constants only.

Feature constants belong inside the feature.

## Import rules

Prefer:

```text
feature → lib
feature → components/ui
feature → shared types
feature → shared utils
```

Avoid:

```text
feature A → feature B internal file
components/ui → feature
lib → feature
utils → feature
```

If a component becomes dependent on business concepts, it is probably not a generic UI component.
