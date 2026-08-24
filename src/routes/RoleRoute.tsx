import { Navigate, Outlet } from 'react-router-dom'

import { ROUTES, type Role } from './routes.config'

type RoleRouteProps = {
  allowedRoles: Role[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  // TODO: wire AuthProvider / useAuth when auth feature exists
  const currentRole: Role | undefined = undefined

  if (currentRole && !allowedRoles.includes(currentRole)) {
    return <Navigate to={ROUTES.unauthorized} replace />
  }

  return <Outlet />
}
