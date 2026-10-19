import { createContext, use } from 'react'

import type { AuthSession, LoginPayload } from '@aros/shared/features/auth/types/auth.types'

export type AuthState =
  | { status: 'restoring' }
  /** Có phiên đã lưu nhưng không gọi được server để khôi phục. */
  | { status: 'offline'; message: string }
  | { status: 'guest' }
  | { status: 'signedIn'; session: AuthSession }

export type AuthContextValue = {
  state: AuthState
  signIn: (payload: LoginPayload) => Promise<void>
  signOut: () => Promise<void>
  retryRestore: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const value = use(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return value
}

export function useSessionRole() {
  const { state } = useAuth()
  return state.status === 'signedIn' ? state.session.role : null
}
