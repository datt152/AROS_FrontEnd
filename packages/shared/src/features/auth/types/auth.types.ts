export type AppRole = 'teacher' | 'student'

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
  /** Cloudflare Turnstile token — verified by BE on /auth/register only */
  captchaToken: string
}

export type AuthSession = {
  email: string
  role: AppRole
  tokenType: string
}

/** GET /v1/users/me */
export type UserProfile = {
  id: number
  accountId: number | null
  email: string
  fullName: string
  role: string
  studentCode: string | null
  profileComplete: boolean
}

export type UpdateStudentCodePayload = {
  studentCode: string
}

/** PUT /v1/users/me — email không gửi; studentCode chỉ STUDENT (optional). */
export type UpdateMePayload = {
  fullName: string
  studentCode?: string
}

/** POST /v1/auth/forgot-password */
export type ForgotPasswordPayload = {
  email: string
}

/** POST /v1/auth/reset-password — token lấy từ ?token= trong link email */
export type ResetPasswordPayload = {
  token: string
  newPassword: string
  confirmPassword: string
}

/** PUT /v1/users/me/password */
export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
