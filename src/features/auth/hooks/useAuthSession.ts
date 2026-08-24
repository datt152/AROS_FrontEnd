import { useQuery } from '@tanstack/react-query'

import { getAccessToken } from '../../../lib/axios'
import { restoreSession } from '../api/auth.api'

export const authKeys = {
  all: ['auth'] as const,
  session: ['auth', 'session'] as const,
}

export function useAuthSession() {
  const sessionQuery = useQuery({
    queryKey: authKeys.session,
    queryFn: restoreSession,
    retry: false,
    staleTime: 5 * 60_000,
  })

  const session = sessionQuery.data ?? null

  return {
    session,
    role: session?.role,
    isAuthenticated: Boolean(getAccessToken() && session),
    isBootstrapping: sessionQuery.isLoading,
  }
}
