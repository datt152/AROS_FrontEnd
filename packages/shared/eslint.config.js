import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

/** Code dùng chung Web + Mobile — xem docs/09-WEB-MOBILE-SHARING.md. */
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
  {
    files: ['src/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
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
          paths: ['react', 'react-dom', 'react-native', 'react-router-dom', 'lucide-react', '@tanstack/react-query'].map(
            (name) => ({ name, message: SHARED_MESSAGE }),
          ),
          patterns: [{ group: ['@aros/web', '@aros/web/*', '**/apps/**'], message: SHARED_MESSAGE }],
        },
      ],
    },
  },
])
