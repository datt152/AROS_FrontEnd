import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { setUnauthorizedHandler } from '../../../lib/axios'
import { authKeys, useAuthSession } from '../hooks/useAuthSession'

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  useAuthSession()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.setQueryData(authKeys.session, null)
    })
    return () => setUnauthorizedHandler(null)
  }, [queryClient])

  return children
}
