import { configureStorage } from '@aros/shared/platform/storage'
import { Storage } from 'expo-sqlite/kv-store'

export function setupStorage() {
  configureStorage({
    getItem: (key) => Storage.getItemSync(key),
    setItem: (key, value) => Storage.setItemSync(key, value),
    removeItem: (key) => {
      Storage.removeItemSync(key)
    },
  })
}
