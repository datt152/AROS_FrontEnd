import '../lib/axios'
import { configureStorage } from '@aros/shared/platform/storage'

try {
  configureStorage(window.localStorage)
} catch {
  configureStorage(null)
}
