import { Navigate, Outlet } from 'react-router-dom'

import { AuthBootScreen } from '../features/auth/components/AuthBootScreen'
import { useAuthSession } from '../features/auth/hooks/useAuthSession'
import { ROUTES, type Role } from './routes.config'

type RoleRouteProps = {
  allowedRoles: Role[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { role, isBootstrapping } = useAuthSession()

  if (isBootstrapping) return <AuthBootScreen />

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.unauthorized} replace />
  }

  return <Outlet />
}
