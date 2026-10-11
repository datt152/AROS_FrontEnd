import { apiClient } from '../../../lib/api/apiClient'
import type {
  ChangePasswordPayload,
  UpdateMePayload,
  UpdateStudentCodePayload,
  UserProfile,
} from '../types/auth.types'

type UserProfileDto = {
  id?: number
  accountId?: number
  email?: string
  fullName?: string
  role?: string
  studentCode?: string | null
  profileComplete?: boolean
}

function normalizeProfile(dto: UserProfileDto): UserProfile {
  if (dto.id === undefined || !dto.email?.trim()) {
    throw new Error('Invalid user profile response')
  }

  const studentCode = dto.studentCode?.trim() || null
  const profileComplete =
    dto.profileComplete ?? (dto.role?.toUpperCase() !== 'STUDENT' || Boolean(studentCode))

  return {
    id: dto.id,
    accountId: dto.accountId ?? null,
    email: dto.email.trim(),
    fullName: dto.fullName?.trim() ?? '',
    role: dto.role?.trim() ?? '',
    studentCode,
    profileComplete,
  }
}

export async function getMe() {
  const response = await apiClient.get<UserProfileDto>('/v1/users/me')
  return normalizeProfile(response.data)
}

export async function updateMe(payload: UpdateMePayload) {
  const body: UpdateMePayload = {
    fullName: payload.fullName.trim(),
  }
  if (payload.studentCode !== undefined) {
    body.studentCode = payload.studentCode.trim()
  }

  const response = await apiClient.put<UserProfileDto>('/v1/users/me', body)
  return normalizeProfile(response.data)
}

/** Sai mật khẩu hiện tại trả 400 (không phải 401) → interceptor không refresh / logout. */
export async function changeMyPassword(payload: ChangePasswordPayload) {
  const response = await apiClient.put<string>('/v1/users/me/password', payload)
  return typeof response.data === 'string' && response.data.trim()
    ? response.data.trim()
    : 'Đổi mật khẩu thành công!'
}

export async function updateMyStudentCode(payload: UpdateStudentCodePayload) {
  const response = await apiClient.put<UserProfileDto | string | null>(
    '/v1/users/me/student-code',
    payload,
  )

  if (response.data && typeof response.data === 'object') {
    return normalizeProfile(response.data)
  }

  return getMe()
}
