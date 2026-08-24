import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login } from '../api/auth.api'
import type { AuthSession, LoginPayload } from '../types/auth.types'
import { authKeys } from './useAuthSession'

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
