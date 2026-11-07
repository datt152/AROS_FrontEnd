import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { LoginForm } from '../components/LoginForm'
import { consumeIdleExpiredFlag } from '../lib/idleTimeout'

type LoginLocationState = {
  sessionExpired?: boolean
  reason?: 'idle' | 'unauthorized'
}

export function LoginPage() {
  const location = useLocation()
  const [expiredMessage] = useState(() => {
    const state = location.state as LoginLocationState | null
    const fromIdleFlag = consumeIdleExpiredFlag()
    if (state?.reason === 'idle' || fromIdleFlag) {
      return 'Bạn đã không thao tác quá 30 phút. Vui lòng đăng nhập lại.'
    }
    if (state?.sessionExpired) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    }
    return null
  })

  return (
    <>
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3">
        <img src="/logo.png" alt="Logo AROS" className="h-12 w-12 object-contain" />

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Nền tảng AROS</p>
            <p className="text-base font-semibold text-slate-900">Đăng nhập để tiếp tục</p>
          </div>
        </div>
      </div>

      <div className="mb-5 hidden lg:block">
        <p className="text-sm font-medium text-blue-600">Chào mừng trở lại</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Đăng nhập vào tài khoản</h2>
        <p className="mt-1.5 text-sm text-slate-500">Nhập thông tin đăng nhập để truy cập lớp học của bạn.</p>
      </div>

      {expiredMessage ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {expiredMessage}
        </p>
      ) : null}

      <LoginForm />
    </>
  )
}
