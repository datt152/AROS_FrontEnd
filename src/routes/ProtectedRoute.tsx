import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { AuthBootScreen } from '../features/auth/components/AuthBootScreen'
import { useAuthSession } from '../features/auth/hooks/useAuthSession'
import { ROUTES } from './routes.config'

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isBootstrapping } = useAuthSession()

  if (isBootstrapping) return <AuthBootScreen />

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
