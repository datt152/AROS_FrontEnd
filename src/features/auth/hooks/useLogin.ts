import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login } from '../api/auth.api'
import type { LoginPayload } from '../types/auth.types'

export const authKeys = {
  all: ['auth'] as const,
  session: ['auth', 'session'] as const,
}

export type AuthSession = {
  email: string
  role: 'teacher' | 'student'
  tokenType: string
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      const session: AuthSession = {
        email: data.email,
        role: data.role,
        tokenType: data.tokenType,
      }
      queryClient.setQueryData(authKeys.session, session)
    },
  })
}
