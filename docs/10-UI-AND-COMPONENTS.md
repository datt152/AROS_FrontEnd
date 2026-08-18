# UI and Component Strategy

## Component levels

### UI primitives

Business-agnostic:

- Button
- Input
- Select
- Dialog
- Modal
- Toast
- Spinner
- LoadingState
- ErrorState
- EmptyState

Location:

```text
components/ui/
```

### Common application components

Reusable across features but aware of application conventions:

- PageHeader
- ConfirmDialog
- DataTable wrapper
- Pagination controls

Location:

```text
components/common/
```

### Feature components

Business-specific:

- QuestionForm
- QuestionTable
- ExamBuilder
- StudentImportDialog
- OMRUploadPanel

Location:

```text
features/<feature>/components/
```

## Rule

If a component contains business vocabulary or business rules, it probably belongs to a feature.

Do not put:

```text
QuestionTable
ExamForm
StudentImportDialog
```

inside generic UI.

## Web/Mobile independence

Web components may use HTML/CSS and Web-specific libraries.

Mobile components use React Native primitives.

Shared business logic should not depend on either.

## State

Prefer the lowest possible state scope.

```text
Component local
    ↓
Feature local
    ↓
Shared client store
```

Move state upward only when multiple consumers actually require it.

## Tables

Complex data tables are Web-specific UI.

Do not put Web table implementations into shared Web/Mobile packages.
