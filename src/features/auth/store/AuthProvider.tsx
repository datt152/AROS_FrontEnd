import type { PropsWithChildren } from 'react'

import { useAuthSession } from '../hooks/useAuthSession'

/** Boot session; idle / 401 redirect do AuthSessionBridge. */
export function AuthProvider({ children }: PropsWithChildren) {
  useAuthSession()
  return children
}
