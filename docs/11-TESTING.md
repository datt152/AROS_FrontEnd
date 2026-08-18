# Testing Strategy

## Test pyramid

```text
        E2E
       /    Integration
   /       Component / Unit
```

## Unit tests

Tool:
- Vitest

Use for:
- pure functions
- score calculations used for UI preview
- transformations
- validation helpers
- domain logic

## Component tests

Tools:
- Vitest
- React Testing Library

Test:
- user-visible behavior
- form validation
- loading/error/empty states
- interactions

Avoid testing implementation details.

## Integration tests

Use for:
- feature workflows
- API integration behavior where practical
- mutation/query interactions

Mock external network boundaries appropriately.

## E2E

Tool:
- Playwright

High-value flows:
- Login
- Create classroom
- Add/import student
- Create question
- Create exam
- Student starts exam
- Student submits exam
- Result viewing
- OMR workflow

Do not attempt to E2E-test every UI component.

## Priority

For a graduation project:

1. Unit tests for important domain logic
2. Component/integration tests for critical forms and workflows
3. E2E for a small number of end-to-end business journeys

Testing should support confidence, not become an independent project.
