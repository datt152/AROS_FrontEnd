export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  tokenType: string
  email: string
  role: string
}

export type RegisterRole = 'TEACHER' | 'STUDENT'

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: RegisterRole
}

export type AuthSession = {
  email: string
  role: 'teacher' | 'student'
  tokenType: string
}

/** GET /v1/users/me */
export type UserProfile = {
  id: number
  email: string
  fullName: string
  role: string
  studentCode: string | null
  profileComplete: boolean
}

export type UpdateStudentCodePayload = {
  studentCode: string
}
