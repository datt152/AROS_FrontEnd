import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Outlet, useNavigate } from 'react-router-dom'

import { getAccessToken, setUnauthorizedHandler } from '../../../lib/axios'
import { useAuthSession } from '../hooks/useAuthSession'
import { getIdleRemainingMs, IDLE_TIMEOUT_MS, isIdleTimedOut, touchActivity } from '../lib/idleTimeout'
import { redirectToLoginAfterSessionExpired } from '../lib/sessionCleanup'

/**
 * - 401 + refresh fail → login
 * - Idle 30 phút không thao tác → login (kể cả đang mở tab / reload)
 * - Có thao tác → gia hạn mốc activity; access hết hạn khi đang dùng → silent refresh
 */
export function AuthSessionBridge() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthSession()
  const idleTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      redirectToLoginAfterSessionExpired(queryClient, navigate, { reason: 'unauthorized' })
    })
    return () => setUnauthorizedHandler(null)
  }, [queryClient, navigate])

  useEffect(() => {
    const clearIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    const expireForIdle = () => {
      redirectToLoginAfterSessionExpired(queryClient, navigate, { reason: 'idle' })
    }

    const scheduleIdleTimer = () => {
      clearIdleTimer()
      if (!isAuthenticated) return

      let remaining = getIdleRemainingMs()
      if (remaining === null) {
        touchActivity()
        remaining = IDLE_TIMEOUT_MS
      }

      idleTimerRef.current = window.setTimeout(expireForIdle, remaining)
    }

    const onActivity = () => {
      if (!isAuthenticated && !getAccessToken()) return

      if (isIdleTimedOut()) {
        expireForIdle()
        return
      }

      touchActivity()
      scheduleIdleTimer()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') onActivity()
    }

    if (isAuthenticated) {
      scheduleIdleTimer()
    }

    document.addEventListener('pointerdown', onActivity, true)
    document.addEventListener('keydown', onActivity, true)
    window.addEventListener('focus', onActivity)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearIdleTimer()
      document.removeEventListener('pointerdown', onActivity, true)
      document.removeEventListener('keydown', onActivity, true)
      window.removeEventListener('focus', onActivity)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [queryClient, navigate, isAuthenticated])

  return <Outlet />
}
