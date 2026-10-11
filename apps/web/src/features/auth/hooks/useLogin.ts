import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login } from '../api/authSession'
import type { AuthSession, LoginPayload } from '@aros/shared/features/auth/types/auth.types'
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
