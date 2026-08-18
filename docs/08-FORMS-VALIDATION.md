# Forms and Validation

## Recommended stack

- React Hook Form
- Zod
- `@hookform/resolvers/zod`

## Why

React Hook Form:
- manages form state
- reduces controlled-input boilerplate
- handles submission/touched/dirty state

Zod:
- defines validation schemas
- performs runtime validation
- can infer TypeScript types

## Example

```ts
const createQuestionSchema = z.object({
  content: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});
```

## Forms in features

Example:

```text
features/question-bank/
├── components/
│   └── QuestionForm.tsx
├── schemas/
│   └── question.schema.ts
└── types/
    └── question.types.ts
```

## Form vs API types

Do not assume:

```text
FormType === APIRequestType
```

A form may contain:
- temporary fields
- UI-only values
- file objects
- fields transformed before submission

Transform explicitly at the API boundary.

## Validation layers

Frontend validation improves UX.

Backend validation remains authoritative.

Never rely on Zod as a security boundary.
