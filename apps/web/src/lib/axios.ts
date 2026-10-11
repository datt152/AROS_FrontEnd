import {
  AUTH_REFRESH_URL,
  apiClient,
  configureApiClient,
  readAccessToken,
  SKIP_AUTH_REFRESH_HEADER,
  type TokenResponse,
} from '@aros/shared/api/apiClient'

/**
 * Cấu hình `apiClient` cho Web: refresh token nằm trong cookie httpOnly.
 * Feature code import `apiClient` (từ đây hoặc `./api/apiClient`) — không gọi `axios.create()` ở nơi khác.
 */
configureApiClient({
  // Relative `/api` → same origin (Vite proxy in dev). Absolute URL must include http(s)://
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  requestNewAccessToken: async () => {
    const response = await apiClient.post<TokenResponse>(
      AUTH_REFRESH_URL,
      {},
      { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
    )
    return readAccessToken(response.data)
  },
})

export * from '@aros/shared/api/apiClient'
export default apiClient
