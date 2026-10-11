import { Outlet } from 'react-router-dom'

import { AuthBootScreen } from '../features/auth/components/AuthBootScreen'
import { StudentCodeRequiredScreen } from '../features/auth/components/StudentCodeRequiredScreen'
import { useAuthSession } from '../features/auth/hooks/useAuthSession'
import { useMe } from '../features/auth/hooks/useMe'
import { getApiErrorMessage } from '../lib/apiError'
import { Button } from '../components/ui/Button'
import { useLogout } from '../features/auth/hooks/useLogout'

/** Chặn sinh viên khi GET /users/me trả profileComplete === false. */
export function StudentProfileGate() {
  const { isAuthenticated, role } = useAuthSession()
  const logout = useLogout()
  const meQuery = useMe({ enabled: isAuthenticated && role === 'student' })

  if (role !== 'student') return <Outlet />

  if (meQuery.isLoading || (meQuery.isFetching && !meQuery.data)) {
    return <AuthBootScreen />
  }

  if (meQuery.isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <p className="max-w-sm text-center text-sm text-red-600">
          {getApiErrorMessage(meQuery.error, 'Không thể tải hồ sơ người dùng')}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void meQuery.refetch()}>
            Thử lại
          </Button>
          <Button variant="ghost" disabled={logout.isPending} onClick={() => logout.mutate()}>
            Đăng xuất
          </Button>
        </div>
      </div>
    )
  }

  if (meQuery.data && !meQuery.data.profileComplete) {
    return <StudentCodeRequiredScreen />
  }

  return <Outlet />
}
