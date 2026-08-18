# AI Coding Agent Workflow

## Purpose

This document is mandatory for AI Coding Agents working on the project.

The agent must preserve architecture and existing decisions instead of optimizing the project according to its own preferences.

## Before coding

For every non-trivial task:

### Step 1 — Understand the task

Identify:
- feature
- user role
- platform
- affected business rules
- API endpoints
- state type
- UI scope

### Step 2 — Read documentation

Always start with:
- `00-INDEX.md`
- `02-ARCHITECTURE.md`

Then read the relevant:
- business rules
- API/data
- state
- authentication
- forms
- Web/Mobile sharing
- testing

### Step 3 — Inspect existing code

Search for:
- similar feature
- existing component
- existing hook
- existing API function
- existing schema
- existing query key
- existing store
- existing error handling

Reuse existing patterns.

### Step 4 — Decide the smallest valid change

Prefer:

```text
existing pattern
      ↓
small extension
```

over:

```text
new abstraction
new library
new architecture
```

## During coding

The agent must:

- follow folder boundaries
- preserve feature boundaries
- use TanStack Query for server state
- use React state for local UI state
- use Zustand only when justified
- use React Hook Form + Zod for complex forms
- use the centralized API client
- reuse generated/API types where available
- avoid duplicating business logic
- keep Web-specific UI out of shared packages

## Before introducing a dependency

The agent must ask for approval before adding a new library unless the task explicitly requested it.

Examples requiring approval:
- another state manager
- another HTTP client
- another form library
- another validation library
- another UI framework
- another data-fetching library

## Before changing architecture

The agent must stop and report:

1. Current architecture
2. Requested change
3. Conflict
4. Why the existing architecture cannot satisfy the task
5. Proposed alternative
6. Files affected

Do not silently refactor architecture.

## When unsure

Prefer asking one focused question rather than guessing when the ambiguity affects:
- business rules
- authentication/security
- API contract
- data ownership
- architectural boundaries

For minor implementation details, use the established project pattern.

## Implementation loop

```text
Read docs
   ↓
Inspect code
   ↓
Find existing pattern
   ↓
Plan minimal change
   ↓
Implement
   ↓
Type-check
   ↓
Lint
   ↓
Run relevant tests
   ↓
Review architecture boundaries
   ↓
Summarize changes
```

## Git checkpoints

Recommended commits:

```text
chore: initialize frontend architecture
feat(auth): implement authentication flow
feat(classroom): add classroom management
feat(question-bank): add question management
feat(exam): add exam management
feat(omr): add OMR workflow
feat(result): add result viewing
test: add critical frontend tests
chore: prepare shared packages for mobile
```

Do not mix unrelated refactors with feature commits.

## AI output requirements

After implementation, report:

### Changed
List files/features changed.

### Why
Explain architectural reason.

### API
List endpoints used/changed.

### State
Explain server/client/UI state decisions.

### Validation
List schemas changed.

### Tests
List checks executed and their results.

### Risks
Mention assumptions or unresolved issues.

## Forbidden AI behavior

The agent must not:

- migrate libraries without approval
- introduce Redux for convenience
- create global state for server data
- move feature code into generic folders just to reduce nesting
- create abstractions solely for perceived professionalism
- rewrite unrelated code
- alter backend contracts without explicit instruction
- weaken TypeScript types to make errors disappear
- bypass authentication/security checks
- store secrets in source code
- treat frontend authorization as backend security
- duplicate existing utilities/components unnecessarily

## Definition of Done

A task is complete only when:

- behavior works
- TypeScript passes
- lint passes where configured
- relevant tests pass
- API behavior matches contract
- state is stored in the correct category
- architecture boundaries remain intact
- no unnecessary dependency was introduced
- documentation is updated if an architectural/business decision changed
