# AI Agent Quick Reference

## Stack

```text
Web: React + TypeScript
Mobile: React Native
Backend: Java + Spring Boot
API: REST + OpenAPI/Swagger
Database: PostgreSQL
HTTP: Axios
Server State: TanStack Query
Forms: React Hook Form
Validation: Zod
Client State: React state first; Zustand only when justified
Testing: Vitest + React Testing Library + Playwright
```

## Golden rules

1. Feature-based architecture.
2. Server state → TanStack Query.
3. UI/local state → React state.
4. Complex shared client state → Zustand only when justified.
5. Forms → React Hook Form + Zod.
6. API calls → centralized Axios client.
7. Backend is authoritative for authorization.
8. Backend is authoritative for final grading.
9. Shared Web/Mobile code must be platform-agnostic.
10. Do not introduce dependencies without approval.
11. Do not change architecture silently.
12. Reuse existing patterns before creating abstractions.
13. Inspect code before coding.
14. Keep changes minimal and focused.
15. Update docs when architecture/business rules change.

## Feature test

Before putting code somewhere, ask:

> Is this business-specific?

Yes → feature.

> Is this reusable UI without business meaning?

Yes → `components/ui`.

> Is this application-wide infrastructure?

Yes → `lib`.

> Is this server-owned data?

Yes → TanStack Query.

> Is this local UI state?

Yes → React state.

> Is this complex client state shared across distant components?

Consider Zustand.

> Could Web and Mobile use this without React DOM/browser assumptions?

Potential shared package.

## Stop conditions

Ask the human before proceeding if:
- API contract is ambiguous
- business rule is ambiguous
- authentication/security behavior is ambiguous
- a new dependency is required
- architecture must change
- existing code contains conflicting patterns with no documented reason
