import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { getAccessToken } from '../lib/axios'
import { ROUTES } from './routes.config'

export function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = Boolean(getAccessToken())

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
