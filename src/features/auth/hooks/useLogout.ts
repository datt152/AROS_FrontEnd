import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { clearAccessToken } from '../../../lib/axios'
import { ROUTES } from '../../../routes/routes.config'
import { logoutRequest } from '../api/auth.api'
import { authKeys } from './useAuthSession'

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      try {
        await logoutRequest()
      } catch {
        // Still clear the client session if the logout endpoint is unavailable.
      } finally {
        clearAccessToken()
      }
    },
    onSettled: () => {
      queryClient.setQueryData(authKeys.session, null)
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      })
      navigate(ROUTES.login, { replace: true })
    },
  })
}
