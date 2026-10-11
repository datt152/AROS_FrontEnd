# Web → Mobile Shared Code Strategy

## Goal

Reuse business logic without forcing Web UI architecture onto React Native.

## Share

Prefer sharing:

```text
API client
API contracts/types
Validation schemas
Domain/business functions
Constants
Pure utilities
Authentication logic where platform-compatible
```

## Do not share by default

Avoid sharing:

```text
HTML
CSS
Web-specific components
React Router
Browser APIs
Web table implementations
Web layouts
Web-specific state/UI abstractions
```

## Architecture

```text
                Shared Core
        ┌──────────┼──────────┐
        │          │          │
       API       Types    Validation
        │          │          │
        └──────────┼──────────┘
                   │
             Domain Logic
             /                     Web             Mobile
        React          React Native
```

## Feature principle

Web and Mobile can have different feature implementations.

Example:

```text
Web:
features/exam/
  ExamListPage
  ExamEditor
  ExamQuestionSelector

Mobile:
features/exam/
  ExamListScreen
  TakingExamScreen
  ResultScreen
```

They can share:

```text
packages/
├── api/
├── types/
├── validation/
└── domain/
```

## Mobile scope

Mobile supports Teacher and Student but only selected high-value functions.

Do not force Mobile to implement every Web feature.

## Monorepo (đã áp dụng — ADR-009)

npm workspaces, không dùng Turborepo/pnpm:

```text
apps/
├── web/            # @aros/web — Vite + React (toàn bộ UI web)
└── mobile/         # @aros/mobile — Expo (khi bắt đầu làm app)

packages/
└── shared/         # @aros/shared — TypeScript thuần, dùng chung Web + Mobile
    └── src/
        ├── api/        # apiClient (configureApiClient), apiError
        ├── platform/   # storage (KeyValueStorage), uploadFile (Blob | {uri,name,type})
        ├── utils/      # sortByNewest
        └── features/   # auth, dashboard, exams, omr, practice, submissions
                        # → api/, types/, lib/ thuần (không UI)
```

Import: `@aros/shared/<đường dẫn trong src, không đuôi .ts>`, ví dụ `@aros/shared/features/omr/types/omr.types`.

### Quy tắc cho `packages/shared`

- Không React, React Native, router, icon, TanStack Query, Tailwind class.
- Không `window`, `document`, `localStorage`, `sessionStorage`, `File`, `import.meta` — ESLint (`packages/shared/eslint.config.js`) chặn.
- Phụ thuộc nền tảng được tiêm từ app lúc khởi động:
  - `configureApiClient({ baseURL, withCredentials, requestNewAccessToken })` — Web: `apps/web/src/lib/axios.ts` (refresh cookie); Mobile: refresh token trong body.
  - `configureStorage(storage)` — Web: `localStorage` (`apps/web/src/app/setupPlatform.ts`); Mobile: MMKV (API đồng bộ).
- Hook TanStack Query nằm trong từng app (tránh lệch phiên bản React giữa Web và Expo).
- Class Tailwind/badge nằm trong `apps/web/src/features/*/components/*Styles.ts`.
- `features/auth/api/auth.api.ts` chỉ chứa request thô; logic phiên (idle timeout, restore bằng cookie) là của Web: `apps/web/src/features/auth/api/authSession.ts`.

Feature chỉ có trên Web (classrooms, questions, subjects, exam-templates, grading, exam-stats, system-settings) giữ nguyên trong `apps/web`.
