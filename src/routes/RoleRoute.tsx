import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'

import { authKeys, type AuthSession } from '../features/auth/hooks/useLogin'
import { ROUTES } from './routes.config'

type RoleRouteProps = {
  allowedRoles: Array<'teacher' | 'student'>
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const queryClient = useQueryClient()
  const session = queryClient.getQueryData<AuthSession>(authKeys.session)
  const currentRole = session?.role

  if (currentRole && !allowedRoles.includes(currentRole)) {
    return <Navigate to={ROUTES.unauthorized} replace />
  }

  return <Outlet />
}
