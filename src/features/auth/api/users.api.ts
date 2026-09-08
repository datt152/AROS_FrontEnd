import { apiClient } from '../../../lib/axios'
import type { UpdateStudentCodePayload, UserProfile } from '../types/auth.types'

type UserProfileDto = {
  id?: number
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
