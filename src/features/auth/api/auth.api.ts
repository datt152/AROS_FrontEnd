import {
  AUTH_REFRESH_URL,
  apiClient,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  SKIP_AUTH_REFRESH_HEADER,
} from '../../../lib/axios'
import type { Role } from '../../../routes/routes.config'
import type { AuthSession, LoginPayload, LoginResponse, RegisterPayload } from '../types/auth.types'

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

function applyAuthSession(data: LoginResponse): AuthSession & { accessToken: string } {
  const role = parseAppRole(data.role)

  if (!role) {
    clearAccessToken()
    throw new UnsupportedRoleError(data.role || 'unknown')
  }

  if (data.accessToken) {
    setAccessToken(data.accessToken)
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
  return applyAuthSession(response.data)
}

export async function refreshSession() {
  const response = await apiClient.post<LoginResponse>(
    AUTH_REFRESH_URL,
    {},
    { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
  )
  return applyAuthSession(response.data)
}

export async function restoreSession(): Promise<AuthSession | null> {
  try {
    const session = await refreshSession()
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

export async function logoutRequest() {
  await apiClient.post('/v1/auth/logout', {}, { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } })
}
