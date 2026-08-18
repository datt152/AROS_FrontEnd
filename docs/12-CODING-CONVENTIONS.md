# Coding Conventions

## TypeScript

Prefer:
- explicit types at public boundaries
- type inference for obvious local values
- `type` for composed aliases where appropriate
- `interface` where extension/structural contracts are useful
- strict TypeScript settings

Avoid:
- `any`
- unsafe type assertions
- duplicated DTO definitions without reason

If `any` is unavoidable, document why.

## Naming

Components:
```text
PascalCase
```

Hooks:
```text
useSomething
```

API functions:
```text
getClasses
createClass
updateClass
deleteClass
```

Files should follow the project's established convention consistently.

## Async code

Prefer `async/await`.

Handle loading/error states explicitly.

## Components

Prefer small components with one clear responsibility.

Do not split every five lines into a component.

## Hooks

A hook should encapsulate reusable React behavior.

Do not create a hook that only renames a single `useState` call unless it provides meaningful abstraction.

## Services

Use services for actual business/integration logic.

Do not create:

```text
exam.service.ts
```

that merely calls another function without adding value.

## Utilities

Utilities should be:
- pure where possible
- generic enough to be reused
- free of React dependencies unless intentionally a hook

## Comments

Comment:
- why something is non-obvious
- business constraints
- workarounds
- security-sensitive behavior

Do not comment obvious code.

## Error handling

Do not silently swallow errors.

Provide:
- user-friendly UI message
- developer diagnostic information where appropriate

Never expose sensitive backend details to users.

## Imports

Prefer path aliases when configured.

Avoid deep imports into another feature's private implementation.

## No speculative abstraction

Do not build:
- generic repository layers
- generic service factories
- generic API wrappers
- generic state abstractions

unless repeated real requirements justify them.
