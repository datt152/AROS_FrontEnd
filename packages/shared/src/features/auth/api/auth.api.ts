import { AUTH_REFRESH_URL, apiClient, SKIP_AUTH_REFRESH_HEADER } from '../../../api/apiClient'
import type {
  AppRole,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
} from '../types/auth.types'

export const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.'
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

export function parseAppRole(role: string): AppRole | null {
  const value = role.trim().toLowerCase()
  if (value === 'teacher') return 'teacher'
  if (value === 'student') return 'student'
  return null
}

export async function loginRequest(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>(
    '/v1/auth/login',
    payload,
    { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
  )
  return response.data
}

export async function refreshRequest() {
  const response = await apiClient.post<LoginResponse>(
    AUTH_REFRESH_URL,
    {},
    { headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' } },
  )
  return response.data
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
