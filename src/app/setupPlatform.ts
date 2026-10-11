import '../lib/axios'
import { configureStorage } from '../lib/storage'

try {
  configureStorage(window.localStorage)
} catch {
  configureStorage(null)
}
