import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { ROUTES } from './routes.config'

export function ProtectedRoute() {
  const location = useLocation()

  // TODO: wire AuthProvider / useAuth when auth feature exists
  const isAuthenticated = false

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
