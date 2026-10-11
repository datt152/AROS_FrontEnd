import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * Axios instance dùng chung cho Web và Mobile — không phụ thuộc trình duyệt.
 * Mỗi nền tảng gọi `configureApiClient()` một lần lúc khởi động (Web: `src/lib/axios.ts`).
 */

export const SKIP_AUTH_REFRESH_HEADER = 'X-Skip-Auth-Refresh'
export const AUTH_REFRESH_URL = '/v1/auth/refresh'

export type TokenResponse = {
  accessToken?: string
  token?: string
  data?: {
    accessToken?: string
    token?: string
  }
}

export type ApiClientConfig = {
  baseURL: string
  withCredentials?: boolean
  /** Lấy access token mới khi gặp 401. Web: refresh cookie; Mobile: refresh token trong body. */
  requestNewAccessToken: () => Promise<string | null>
}

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let accessToken: string | null = null
let unauthorizedHandler: (() => void) | null = null
let requestNewAccessToken: ApiClientConfig['requestNewAccessToken'] = async () => null
let interceptorsInstalled = false

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}

/** Register session cleanup + redirect (AuthSessionBridge). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export const apiClient = axios.create({
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function readAccessToken(payload: TokenResponse) {
  return payload.accessToken ?? payload.token ?? payload.data?.accessToken ?? payload.data?.token ?? null
}

function shouldSkipAuthRefresh(config: InternalAxiosRequestConfig) {
  const header =
    typeof config.headers.get === 'function'
      ? config.headers.get(SKIP_AUTH_REFRESH_HEADER)
      : config.headers[SKIP_AUTH_REFRESH_HEADER]
  return String(header) === '1'
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken()
      .then((token) => {
        setAccessToken(token)
        return token
      })
      .catch(() => {
        setAccessToken(null)
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

function installInterceptors() {
  apiClient.interceptors.request.use((config) => {
    if (shouldSkipAuthRefresh(config)) {
      return config
    }

    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryConfig | undefined
      const status = error.response?.status

      if (
        !originalRequest ||
        shouldSkipAuthRefresh(originalRequest) ||
        originalRequest._retry ||
        status !== 401
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      const token = await refreshAccessToken()

      if (!token) {
        unauthorizedHandler?.()
        if (!unauthorizedHandler) {
          clearAccessToken()
        }
        return Promise.reject(error)
      }

      originalRequest.headers.Authorization = `Bearer ${token}`
      return apiClient(originalRequest)
    },
  )
}

export function configureApiClient(config: ApiClientConfig) {
  apiClient.defaults.baseURL = config.baseURL
  apiClient.defaults.withCredentials = config.withCredentials ?? false
  requestNewAccessToken = config.requestNewAccessToken

  if (!interceptorsInstalled) {
    interceptorsInstalled = true
    installInterceptors()
  }
}
