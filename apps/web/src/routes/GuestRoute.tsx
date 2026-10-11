import { Navigate, Outlet } from 'react-router-dom'

import { AuthBootScreen } from '../features/auth/components/AuthBootScreen'
import { useAuthSession } from '../features/auth/hooks/useAuthSession'
import { getHomePathForRole } from './routes.config'

export function GuestRoute() {
  const { isAuthenticated, isBootstrapping, role } = useAuthSession()

  if (isBootstrapping) return <AuthBootScreen />

  if (isAuthenticated && role) {
    return <Navigate to={getHomePathForRole(role)} replace />
  }

  return <Outlet />
}
