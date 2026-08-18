# API and Data Strategy

## Stack

- Axios for HTTP transport
- TanStack Query for server state
- Spring Boot REST API
- Swagger/OpenAPI as API contract

## Flow

```text
Component
   ↓
Feature Hook
   ↓
TanStack Query
   ↓
Feature API function
   ↓
Axios
   ↓
Spring Boot REST API
   ↓
PostgreSQL
```

Response:

```text
PostgreSQL
   ↓
Spring Boot
   ↓
JSON
   ↓
Axios
   ↓
TanStack Query cache
   ↓
Hook
   ↓
Component
```

## API organization

Feature-specific endpoints stay with the feature.

Example:

```text
features/classroom/api/classroom.api.ts
features/question-bank/api/question.api.ts
features/exam/api/exam.api.ts
```

Do not create one giant `api.ts`.

## Example

```ts
export async function getClasses() {
  const response = await apiClient.get<Classroom[]>("/classes");
  return response.data;
}
```

Hook:

```ts
export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });
}
```

Component:

```tsx
const { data, isLoading, error } = useClasses();
```

## Mutations

Example:

```text
POST /api/classes
```

Use `useMutation`.

After success:
- invalidate affected query
- update cache directly only when justified

## Pagination

Use TanStack Query pagination for normal page-based APIs.

For infinite scrolling, use `useInfiniteQuery` only when the UI actually needs infinite loading.

Do not use infinite queries by default.

## API error handling

Centralize transport-level concerns in Axios.

Feature-level code handles business meaning.

Example:

```text
Axios
→ network error
→ 401
→ timeout
```

Feature:

```text
→ "Student import failed"
→ "Exam cannot be published"
```

## OpenAPI/code generation

Because Spring Boot exposes Swagger/OpenAPI, generated TypeScript types are preferred when the backend contract is sufficiently stable.

Recommended direction:

```text
Spring Boot
   ↓
OpenAPI
   ↓
Generated TypeScript API types/client
   ↓
Frontend
```

Do not maintain duplicate handwritten API response types if generated types can reliably represent the backend contract.

However, frontend form/view-model types may remain separate when they intentionally differ from API DTOs.

## DTO vs domain vs form

### API DTO

Matches backend contract.

### Domain type

Represents frontend business meaning when transformation is needed.

### Form type

Represents what the user edits.

Do not force all three to be identical.

## Example endpoints

```text
GET  /api/classes
POST /api/classes

GET  /api/questions
POST /api/questions

POST /api/exams
```

Actual paths must follow the backend OpenAPI contract.
