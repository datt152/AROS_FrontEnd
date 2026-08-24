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
