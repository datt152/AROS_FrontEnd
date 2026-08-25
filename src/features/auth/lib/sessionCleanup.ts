import type { QueryClient } from '@tanstack/react-query'
import type { NavigateFunction } from 'react-router-dom'

import { clearAccessToken } from '../../../lib/axios'
import { ROUTES } from '../../../routes/routes.config'
import { logoutRequest } from '../api/auth.api'
import { authKeys } from '../hooks/useAuthSession'
import { clearActivityTracking, markIdleExpiredFlag } from './idleTimeout'

let isHandlingSessionExpiry = false

/** Xóa token + cache API (giữ query auth). */
export function clearClientSession(queryClient: QueryClient) {
  clearAccessToken()
  clearActivityTracking()
  queryClient.setQueryData(authKeys.session, null)
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== 'auth',
  })
}

type ExpireOptions = {
  /** Idle timeout vs refresh/cookie fail */
  reason?: 'idle' | 'unauthorized'
}

/** Clear refresh cookie + client session → login. */
export function redirectToLoginAfterSessionExpired(
  queryClient: QueryClient,
  navigate: NavigateFunction,
  options: ExpireOptions = {},
) {
  if (isHandlingSessionExpiry) return
  isHandlingSessionExpiry = true

  if (options.reason === 'idle') {
    markIdleExpiredFlag()
  }

  void logoutRequest().catch(() => {
    // Cookie có thể đã hết — vẫn clear client.
  })
  clearClientSession(queryClient)
  navigate(ROUTES.login, {
    replace: true,
    state: {
      sessionExpired: true,
      reason: options.reason ?? 'unauthorized',
    },
  })

  window.setTimeout(() => {
    isHandlingSessionExpiry = false
  }, 1000)
}
