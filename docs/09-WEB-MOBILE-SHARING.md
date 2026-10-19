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
└── mobile/         # @aros/mobile — Expo SDK 57 + expo-router (routes trong src/app)

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
  - `configureApiClient({ baseURL, withCredentials, headers, requestNewAccessToken })` — Web: `apps/web/src/lib/axios.ts` (refresh cookie); Mobile: `apps/mobile/src/platform/apiClient.ts` (header `X-Client-Type: mobile`, refresh token trong body, lưu bằng `expo-secure-store`).
  - `configureStorage(storage)` — Web: `localStorage` (`apps/web/src/app/setupPlatform.ts`); Mobile: `expo-sqlite/kv-store` (API đồng bộ, chạy được trên Expo Go) trong `apps/mobile/src/platform/storage.ts`.
- Hook TanStack Query nằm trong từng app (tránh lệch phiên bản React giữa Web và Expo).
- Class Tailwind/badge nằm trong `apps/web/src/features/*/components/*Styles.ts`.
- `features/auth/api/auth.api.ts` chỉ chứa request thô; logic phiên nằm ở từng app: Web `apps/web/src/features/auth/api/authSession.ts` (idle timeout, restore bằng cookie), Mobile `apps/mobile/src/features/auth/api/authSession.ts` (refresh token xoay vòng, gộp các refresh đồng thời thành một request).

### App mobile (`apps/mobile`)

- Chạy: `npm run mobile` ở thư mục gốc (Expo Go hoặc development build). Địa chỉ backend đặt trong `apps/mobile/.env.local` (`EXPO_PUBLIC_API_URL`, xem `.env.example`).
- Cài thư viện bằng `npx expo install <pkg>` trong `apps/mobile` để có phiên bản khớp SDK.
- React của mobile (theo Expo SDK) có thể khác bản của web; Metro tự ép mọi package dùng một bản React của mobile (`autolinkingModuleResolution`, mặc định trong monorepo từ SDK 55). `expo-doctor` vẫn báo trùng `react` vì `node_modules` có hai bản — không ảnh hưởng bundle.
- Điều hướng theo vai trò bằng `Stack.Protected` trong `src/app/_layout.tsx`: `/login`, `/teacher/*` (tab OMR), `/student/*` (tab tổng quan, luyện tập, bài thi).

Feature chỉ có trên Web (classrooms, questions, subjects, exam-templates, grading, exam-stats, system-settings) giữ nguyên trong `apps/web`.
