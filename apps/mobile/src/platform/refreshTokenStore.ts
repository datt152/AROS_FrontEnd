import * as SecureStore from 'expo-secure-store'

const REFRESH_TOKEN_KEY = 'aros.refreshToken'

export function getRefreshToken() {
  return SecureStore.getItem(REFRESH_TOKEN_KEY)
}

export function saveRefreshToken(token: string) {
  SecureStore.setItem(REFRESH_TOKEN_KEY, token)
}

export async function clearRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
}
