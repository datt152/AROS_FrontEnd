import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

import { setUnauthorizedHandler } from '@aros/shared/api/apiClient'
import { getApiErrorMessage } from '@aros/shared/api/apiError'
import type { LoginPayload } from '@aros/shared/features/auth/types/auth.types'

import { hasStoredSession, login, logout, restoreSession } from '../api/authSession'
import { AuthContext, type AuthState } from './authContext'

const OFFLINE_MESSAGE = 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.'

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({ status: 'restoring' })

  const restore = useCallback(async () => {
    setState({ status: 'restoring' })
    try {
      const session = await restoreSession()
      setState(session ? { status: 'signedIn', session } : { status: 'guest' })
    } catch (error) {
      setState({ status: 'offline', message: getApiErrorMessage(error, OFFLINE_MESSAGE) })
    }
  }, [])

  useEffect(() => {
    void restore()
  }, [restore])

  useEffect(() => {
    // Refresh lỗi do mất mạng thì token vẫn còn: giữ phiên, chỉ request hiện tại thất bại.
    setUnauthorizedHandler(() => {
      if (hasStoredSession()) return
      queryClient.clear()
      setState({ status: 'guest' })
    })
    return () => setUnauthorizedHandler(null)
  }, [queryClient])

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const session = await login(payload)
      queryClient.clear()
      setState({ status: 'signedIn', session })
    },
    [queryClient],
  )

  const signOut = useCallback(async () => {
    await logout()
    queryClient.clear()
    setState({ status: 'guest' })
  }, [queryClient])

  const value = useMemo(
    () => ({ state, signIn, signOut, retryRestore: () => void restore() }),
    [state, signIn, signOut, restore],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
