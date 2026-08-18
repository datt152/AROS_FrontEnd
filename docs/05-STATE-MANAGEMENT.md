# State Management

## Core principle

Do not use one state-management solution for everything.

Classify state first.

## 1. Server State

Data owned by the backend.

Examples:
- Class list
- Question list
- User profile
- Subjects
- Exams
- Results

Technology:

**TanStack Query**

Responsibilities:
- fetching
- caching
- request deduplication
- refetching
- mutations
- invalidation
- pagination
- infinite queries
- loading/error state

## 2. Client State

State owned by the frontend application and needed across multiple components.

Examples:
- active exam session answers
- complex multi-step client workflow
- temporary cross-component selections

Preferred order:

1. React state
2. feature-local state
3. Zustand only when genuinely shared/complex

Do not create Zustand stores automatically.

## 3. UI State

Short-lived presentation state.

Examples:
- modal open/closed
- selected tab
- dropdown open
- local input state

Use React `useState` or local component state.

## 4. Form State

Use:

- React Hook Form
- Zod for validation

Do not put ordinary form fields into Redux/Zustand.

## Decision table

| State | Default |
|---|---|
| API data | TanStack Query |
| API loading/error | TanStack Query |
| Form values | React Hook Form |
| Modal open | useState |
| Selected tab | useState |
| Page-local selection | useState |
| Complex shared client workflow | Zustand if justified |
| Auth session | Auth-specific client state + token strategy |
| Final result | TanStack Query |

## Cache invalidation

After a successful mutation, invalidate or update the affected query.

Example:

```text
POST /classes
    ↓
success
    ↓
invalidate ["classes"]
    ↓
GET /classes
```

Do not manually duplicate server data in a global store.

## Optimistic updates

Use only when:
- the operation is predictable,
- rollback is possible,
- UX meaningfully improves.

For high-risk operations such as final exam submission, prefer confirmed server responses over aggressive optimistic behavior.
