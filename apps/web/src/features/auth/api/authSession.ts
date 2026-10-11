import { clearAccessToken, getAccessToken, setAccessToken } from '@aros/shared/api/apiClient'
import {
  clearActivityTracking,
  getIdleRemainingMs,
  isIdleTimedOut,
  markIdleExpiredFlag,
  touchActivity,
} from '../lib/idleTimeout'
import type { AuthSession, LoginPayload, LoginResponse } from '@aros/shared/features/auth/types/auth.types'
import { loginRequest, logoutRequest, parseAppRole, refreshRequest, UnsupportedRoleError } from '@aros/shared/features/auth/api/auth.api'

function applyAuthSession(
  data: LoginResponse,
  options: { trackActivity?: boolean } = {},
): AuthSession & { accessToken: string } {
  const role = parseAppRole(data.role)

  if (!role) {
    clearAccessToken()
    throw new UnsupportedRoleError(data.role || 'unknown')
  }

  if (data.accessToken) {
    setAccessToken(data.accessToken)
  }

  // Chỉ login / restore thành công lần đầu mới nên gọi touch ngoài — refresh 401 không reset idle.
  if (options.trackActivity) {
    touchActivity()
  }

  return {
    accessToken: data.accessToken,
    email: data.email,
    role,
    tokenType: data.tokenType,
  }
}

export async function login(payload: LoginPayload) {
  return applyAuthSession(await loginRequest(payload), { trackActivity: true })
}

export async function refreshSession() {
  return applyAuthSession(await refreshRequest(), { trackActivity: false })
}

export async function restoreSession(): Promise<AuthSession | null> {
  // AFK quá lâu rồi reload → không restore bằng refresh cookie.
  if (isIdleTimedOut()) {
    markIdleExpiredFlag()
    clearAccessToken()
    clearActivityTracking()
    try {
      await logoutRequest()
    } catch {
      // ignore
    }
    return null
  }

  try {
    const session = await refreshSession()
    // Restore thành công: nếu chưa có mốc activity thì tạo; không gia hạn nếu đã có.
    if (getIdleRemainingMs() === null) {
      touchActivity()
    }
    return {
      email: session.email,
      role: session.role,
      tokenType: session.tokenType,
    }
  } catch {
    if (getAccessToken()) {
      throw new Error('LOGIN_IN_PROGRESS')
    }
    clearAccessToken()
    clearActivityTracking()
    return null
  }
}
