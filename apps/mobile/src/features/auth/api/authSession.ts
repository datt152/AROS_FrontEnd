import { isAxiosError } from 'axios'

import { clearAccessToken, setAccessToken } from '@aros/shared/api/apiClient'
import {
  loginRequest,
  logoutRequest,
  parseAppRole,
  refreshRequest,
  UnsupportedRoleError,
} from '@aros/shared/features/auth/api/auth.api'
import type { AuthSession, LoginPayload, LoginResponse } from '@aros/shared/features/auth/types/auth.types'

import { clearRefreshToken, getRefreshToken, saveRefreshToken } from '@/platform/refreshTokenStore'

export class SessionExpiredError extends Error {
  constructor() {
    super('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    this.name = 'SessionExpiredError'
  }
}

type ActiveSession = AuthSession & { accessToken: string }

async function applySession(data: LoginResponse): Promise<ActiveSession> {
  const role = parseAppRole(data.role)

  if (!role) {
    clearAccessToken()
    await clearRefreshToken()
    if (data.refreshToken) {
      void logoutRequest(data.refreshToken).catch(() => undefined)
    }
    throw new UnsupportedRoleError(data.role || 'unknown')
  }

  setAccessToken(data.accessToken)
  if (data.refreshToken) {
    saveRefreshToken(data.refreshToken)
  }

  return {
    accessToken: data.accessToken,
    email: data.email,
    role,
    tokenType: data.tokenType,
  }
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  return applySession(await loginRequest(payload))
}

/** Server có 4xx = token bị thu hồi / hết hạn; lỗi mạng hoặc 5xx thì giữ token để thử lại. */
function isRejectedByServer(error: unknown) {
  return isAxiosError(error) && error.response !== undefined && error.response.status < 500
}

async function rotateRefreshToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new SessionExpiredError()
  }

  try {
    return await applySession(await refreshRequest(refreshToken))
  } catch (error) {
    if (isRejectedByServer(error)) {
      clearAccessToken()
      await clearRefreshToken()
      throw new SessionExpiredError()
    }
    throw error
  }
}

let refreshInFlight: Promise<ActiveSession> | null = null

/**
 * Mỗi refresh token chỉ dùng được một lần (server xoay token, dùng lại sau ân hạn sẽ hủy mọi phiên),
 * nên mọi lời gọi đồng thời phải dùng chung một request.
 */
export function refreshSession() {
  refreshInFlight ??= rotateRefreshToken().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

/** `null` = chưa đăng nhập hoặc phiên đã hết hạn; ném lỗi khi không kết nối được server. */
export async function restoreSession(): Promise<AuthSession | null> {
  if (!getRefreshToken()) {
    return null
  }

  try {
    return await refreshSession()
  } catch (error) {
    if (error instanceof SessionExpiredError || error instanceof UnsupportedRoleError) {
      return null
    }
    throw error
  }
}

export function hasStoredSession() {
  return getRefreshToken() !== null
}

export async function logout() {
  const refreshToken = getRefreshToken()
  clearAccessToken()
  await clearRefreshToken()
  if (refreshToken) {
    void logoutRequest(refreshToken).catch(() => undefined)
  }
}
