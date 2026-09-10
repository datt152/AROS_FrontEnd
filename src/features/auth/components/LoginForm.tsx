import { useState } from 'react'
import { Eye, EyeOff, Lock, ShieldOff, User, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../../../lib/apiError'
import { focusFirstFormError } from '../../../utils/focusFormError'
import { ROUTES, type Role } from '../../../routes/routes.config'
import { UnsupportedRoleError } from '../api/auth.api'
import { useLogin } from '../hooks/useLogin'

type FieldErrors = {
  email?: string
  password?: string
}

const REMEMBERED_EMAIL_KEY = 'aros.rememberedEmail'

function getHomePathForRole(role: Role) {
  return role === 'teacher' ? ROUTES.teacher.dashboard : ROUTES.student.dashboard
}

function isUnsupportedRoleError(error: unknown): error is UnsupportedRoleError {
  return error instanceof UnsupportedRoleError
}

function getRedirectPath(from: unknown, role: Role) {
  if (from && typeof from === 'object' && 'pathname' in from) {
    const pathname = (from as { pathname?: string }).pathname
    if (pathname && pathname.startsWith(`/${role}`)) return pathname
  }
  return getHomePathForRole(role)
}

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLogin()

  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY)))
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Vui lòng nhập email hợp lệ'
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, ['email', 'password'])
      return
    }

    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      })

      if (rememberMe) localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim())
      else localStorage.removeItem(REMEMBERED_EMAIL_KEY)

      const from = (location.state as { from?: unknown } | null)?.from
      navigate(getRedirectPath(from, result.role), { replace: true })
    } catch {
      // Error is shown via loginMutation.error
    }
  }

  const roleError = isUnsupportedRoleError(loginMutation.error) ? loginMutation.error : null
  const apiError =
    !roleError && loginMutation.error ? getApiErrorMessage(loginMutation.error) : null
  const notice =
    typeof (location.state as { notice?: unknown } | null)?.notice === 'string'
      ? (location.state as { notice: string }).notice
      : null

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
      ) : null}
      {apiError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{apiError}</p>
      ) : null}

      {roleError ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="unsupported-role-title"
          aria-describedby="unsupported-role-desc"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ShieldOff className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <button
                type="button"
                onClick={() => loginMutation.reset()}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <h3 id="unsupported-role-title" className="mt-3 text-base font-semibold text-slate-900">
              Vai trò không được hỗ trợ
            </h3>
            <p id="unsupported-role-desc" className="mt-1.5 text-sm text-slate-600">
              Truy cập bị từ chối. Tài khoản của bạn không có quyền đăng nhập vào ứng dụng này.
              <br />
              <i>Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.</i>
            </p>
            <button
              type="button"
              onClick={() => loginMutation.reset()}
              className="mt-4 h-10 w-full rounded-xl bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Đóng
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.75}
          />
          <input
            id="email"
            name="email"
            type="text"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
            }}
            placeholder="Nhập email của bạn"
            className={`h-10 w-full rounded-xl border bg-slate-50/70 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${errors.email
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
              }`}
          />
        </div>
        {errors.email ? <p className="text-sm text-red-500">{errors.email}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.75}
          />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (errors.password) setErrors((current) => ({ ...current, password: undefined }))
            }}
            placeholder="Nhập mật khẩu"
            className={`h-10 w-full rounded-xl border bg-slate-50/70 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${errors.password
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
              }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
        {errors.password ? <p className="text-sm text-red-500">{errors.password}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
          />
          <span className="text-sm text-slate-600">Ghi nhớ đăng nhập</span>
        </label>
        <a href="#" className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
          Quên mật khẩu?
        </a>
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="h-10 w-full rounded-xl bg-linear-to-r from-blue-600 to-emerald-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      <p className="text-center text-sm text-slate-600">
        Chưa có tài khoản giáo viên?{' '}
        <Link to={ROUTES.register} className="font-medium text-blue-600 transition hover:text-blue-700">
          Đăng ký
        </Link>
      </p>
    </form>
  )
}
