import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/** Code sẽ chuyển sang `packages/shared` (dùng chung Web + Mobile) — xem docs/09-WEB-MOBILE-SHARING.md. */
const SHARED_CANDIDATE_FILES = [
  'src/lib/api/**/*.ts',
  'src/lib/storage.ts',
  'src/lib/uploadFile.ts',
  'src/lib/apiError.ts',
  'src/lib/sortByNewest.ts',
  'src/features/{auth,dashboard,exams,omr,practice,submissions}/{api,types}/**/*.ts',
  'src/features/auth/lib/passwordValidation.ts',
  'src/features/exams/lib/examTakeDraft.ts',
  'src/features/omr/lib/omrErrors.ts',
]

const SHARED_MESSAGE = 'Code dùng chung Web/Mobile không được phụ thuộc trình duyệt, React hay UI.'

const BROWSER_GLOBALS = [
  'window',
  'document',
  'localStorage',
  'sessionStorage',
  'navigator',
  'location',
  'history',
  'File',
  'FileReader',
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Syncing query/URL → local state in effects is common; keep as warning for CI.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: SHARED_CANDIDATE_FILES,
    rules: {
      'no-restricted-globals': [
        'error',
        ...BROWSER_GLOBALS.map((name) => ({ name, message: SHARED_MESSAGE })),
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MetaProperty[meta.name='import'][property.name='meta']",
          message: 'Không dùng import.meta (Vite) trong code dùng chung — cấu hình qua configureApiClient().',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: ['react', 'react-dom', 'react-router-dom', 'lucide-react', '@tanstack/react-query'].map(
            (name) => ({ name, message: SHARED_MESSAGE }),
          ),
          patterns: [
            {
              group: ['**/lib/axios', '**/components/**', '**/pages/**', '**/hooks/**', '**/layouts/**'],
              message: SHARED_MESSAGE,
            },
          ],
        },
      ],
    },
  },
  {
    // Router module exports both the router config and AppRouter component.
    files: ['src/routes/index.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
