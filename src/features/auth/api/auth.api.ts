import {
  AUTH_REFRESH_URL,
  apiClient,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  SKIP_AUTH_REFRESH_HEADER,
} from '../../../lib/axios'
import type { Role } from '../../../routes/routes.config'
import { clearActivityTracking, getIdleRemainingMs, isIdleTimedOut, markIdleExpiredFlag, touchActivity } from '../lib/idleTimeout'
import type {
  AuthSession,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
} from '../types/auth.types'

export const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  'Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi.'
export const RESET_PASSWORD_SUCCESS_MESSAGE = 'Đặt lại mật khẩu thành công!'

function readTextMessage(data: unknown, fallback: string) {
  return typeof data === 'string' && data.trim() ? data.trim() : fallback
}

export class UnsupportedRoleError extends Error {
  readonly receivedRole: string

  constructor(receivedRole: string) {
    super('Tài khoản này không được phép đăng nhập. Chỉ hỗ trợ vai trò Sinh viên và Giáo viên.')
    this.name = 'UnsupportedRoleError'
    this.receivedRole = receivedRole
  }
}

export function parseAppRole(role: string): Role | null {
  const value = role.trim().toLowerCase()
  if (value === 'teacher') return 'teacher'
  if (value === 'student') return 'student'
  return null
}

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
  const response = await apiClient.post<LoginResponse>(
    '/v1/auth/login',
    payload,
    { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
  )
  return applyAuthSession(response.data, { trackActivity: true })
}

export async function refreshSession() {
  const response = await apiClient.post<LoginResponse>(
    AUTH_REFRESH_URL,
    {},
    { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
  )
  return applyAuthSession(response.data, { trackActivity: false })
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

export async function register(payload: RegisterPayload) {
  const response = await apiClient.post<string>(
    '/v1/auth/register',
    payload,
    { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
  )
  return response.data
}

/** Luôn 200 cùng một câu (kể cả email không tồn tại / đang cooldown) — không lộ email nào có tài khoản. */
export async function forgotPassword(payload: ForgotPasswordPayload) {
  const response = await apiClient.post<string>(
    '/v1/auth/forgot-password',
    { email: payload.email.trim() },
    { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
  )
  return readTextMessage(response.data, FORGOT_PASSWORD_SUCCESS_MESSAGE)
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await apiClient.post<string>('/v1/auth/reset-password', payload, {
    headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' },
  })
  return readTextMessage(response.data, RESET_PASSWORD_SUCCESS_MESSAGE)
}

export async function logoutRequest() {
  await apiClient.post('/v1/auth/logout', {}, { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } })
}
