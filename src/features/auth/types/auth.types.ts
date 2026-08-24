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
