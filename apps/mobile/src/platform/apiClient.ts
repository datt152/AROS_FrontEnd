import { configureApiClient } from '@aros/shared/api/apiClient'

import { refreshSession } from '@/features/auth/api/authSession'

/** 10.0.2.2 = máy tính chạy backend, nhìn từ Android Emulator. */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://10.0.2.2:8080/api'

export function setupApiClient() {
  configureApiClient({
    baseURL: API_BASE_URL,
    withCredentials: false,
    headers: { 'X-Client-Type': 'mobile' },
    requestNewAccessToken: async () => (await refreshSession()).accessToken,
  })
}
