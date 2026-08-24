import { apiClient, clearAccessToken, setAccessToken, SKIP_AUTH_REFRESH_HEADER } from '../../../lib/axios'
import type { Role } from '../../../routes/routes.config'
import type { LoginPayload, LoginResponse, RegisterPayload } from '../types/auth.types'

export class UnsupportedRoleError extends Error {
  readonly receivedRole: string

  constructor(receivedRole: string) {
    super('This account is not allowed to sign in. Only Student and Teacher roles are supported.')
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

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>(
    '/v1/auth/login',
    payload,
    { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
  )
  const data = response.data
  const role = parseAppRole(data.role)

  if (!role) {
    clearAccessToken()
    throw new UnsupportedRoleError(data.role || 'unknown')
  }

  if (data.accessToken) {
    setAccessToken(data.accessToken)
  }

  return {
    ...data,
    role,
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
