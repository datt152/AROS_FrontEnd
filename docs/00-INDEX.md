# Frontend Documentation — Single Source of Truth

## Purpose

This directory is the canonical documentation source for the frontend of the graduation project.

It is written for:
- AI Coding Agents
- Human developers
- Future Web and Mobile development

The documentation defines architecture, business rules, coding conventions, API rules, state-management rules, authentication, shared-code boundaries, testing strategy, and the required AI coding workflow.

## Source-of-truth priority

When information conflicts, follow this order:

1. `01-PROJECT-CONTEXT.md`
2. `02-ARCHITECTURE.md`
3. `03-DOMAIN-AND-BUSINESS-RULES.md`
4. `04-FOLDER-STRUCTURE.md`
5. `05-STATE-MANAGEMENT.md`
6. `06-API-AND-DATA.md`
7. `07-AUTHENTICATION.md`
8. `08-FORMS-VALIDATION.md`
9. `09-WEB-MOBILE-SHARING.md`
10. `10-UI-AND-COMPONENTS.md`
11. `11-TESTING.md`
12. `12-CODING-CONVENTIONS.md`
13. `13-AI-CODING-WORKFLOW.md`

Actual source code and backend OpenAPI contract override documentation when the documentation is explicitly marked as stale; otherwise the agent must not silently change architecture.

## AI Agent rule

Before implementing a non-trivial task:

1. Read this index.
2. Read the relevant architecture/domain document.
3. Inspect the existing code before creating new abstractions.
4. Reuse existing patterns.
5. Do not introduce a new library or architectural pattern without explicit approval.
6. Do not move code across architectural boundaries merely for stylistic reasons.
7. If a requested change conflicts with these documents, stop and explain the conflict.

## Documentation update rule

When an architectural or business decision changes, update the relevant Markdown document in the same change/commit as the code whenever practical.
