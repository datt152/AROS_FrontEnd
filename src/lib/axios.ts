import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * Single shared Axios instance for the whole app.
 * Feature code must import `apiClient` from here — do not call `axios.create()` elsewhere.
 */

export const SKIP_AUTH_REFRESH_HEADER = 'X-Skip-Auth-Refresh'
export const AUTH_REFRESH_URL = '/v1/auth/refresh'

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type TokenResponse = {
  accessToken?: string
  token?: string
  data?: {
    accessToken?: string
    token?: string
  }
}

let accessToken: string | null = null
let unauthorizedHandler: (() => void) | null = null

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
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

function readAccessToken(payload: TokenResponse) {
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
    refreshPromise = apiClient
      .post<TokenResponse>(
        AUTH_REFRESH_URL,
        {},
        { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
      )
      .then((response) => {
        const token = readAccessToken(response.data)
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

export default apiClient
