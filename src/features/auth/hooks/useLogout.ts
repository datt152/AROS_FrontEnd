import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '../../../routes/routes.config'
import { logoutRequest } from '../api/auth.api'
import { clearClientSession } from '../lib/sessionCleanup'

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      try {
        await logoutRequest()
      } catch {
        // Still clear the client session if the logout endpoint is unavailable.
      }
    },
    onSettled: () => {
      clearClientSession(queryClient)
      navigate(ROUTES.login, { replace: true })
    },
  })
}
