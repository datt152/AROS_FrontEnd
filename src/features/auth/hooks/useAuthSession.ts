import { useQuery } from '@tanstack/react-query'

import { getAccessToken } from '../../../lib/axios'
import { STALE_TIME } from '../../../lib/queryStaleTime'
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
    staleTime: STALE_TIME.auth,
  })

  const session = sessionQuery.data ?? null

  return {
    session,
    role: session?.role,
    isAuthenticated: Boolean(getAccessToken() && session),
    isBootstrapping: sessionQuery.isLoading,
  }
}
