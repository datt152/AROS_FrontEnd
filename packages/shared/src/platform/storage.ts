/**
 * Key-value storage đồng bộ, không phụ thuộc nền tảng.
 * Web: `localStorage` (`apps/web/src/app/setupPlatform.ts`); Mobile: `expo-sqlite/kv-store` (`apps/mobile/src/platform/storage.ts`).
 */
export type KeyValueStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

let storage: KeyValueStorage | null = null

export function configureStorage(next: KeyValueStorage | null) {
  storage = next
}

/** `null` khi nền tảng chưa cấu hình hoặc storage bị chặn (private mode). */
export function getStorage() {
  return storage
}
