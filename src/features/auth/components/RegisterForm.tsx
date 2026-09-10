import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../../../lib/apiError'
import { ROUTES } from '../../../routes/routes.config'
import { useRegister } from '../hooks/useRegister'

type FieldErrors = {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function RegisterForm() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {}

    if (!fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên'
    } else if (fullName.trim().length < 2) {
      nextErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự'
    }

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

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Mật khẩu không khớp'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      const message = await registerMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role: 'TEACHER',
      })

      navigate(ROUTES.login, {
        replace: true,
        state: {
          notice: typeof message === 'string' && message.trim() ? message : 'Tạo tài khoản thành công. Vui lòng đăng nhập.',
        },
      })
    } catch {
      // Error is shown via registerMutation.error
    }
  }

  const apiError = registerMutation.error
    ? getApiErrorMessage(registerMutation.error, 'Không thể tạo tài khoản')
    : null

  const inputClass = (hasError?: string) =>
    `h-10 w-full rounded-xl border bg-slate-50/70 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
    }`

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
      {apiError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{apiError}</p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
          Họ và tên
        </label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.75}
          />
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value)
              if (errors.fullName) setErrors((current) => ({ ...current, fullName: undefined }))
            }}
            placeholder="Nhập họ và tên"
            className={inputClass(errors.fullName)}
          />
        </div>
        {errors.fullName ? <p className="text-sm text-red-500">{errors.fullName}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <div className="relative">
          <Mail
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
            className={inputClass(errors.email)}
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
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (errors.password) setErrors((current) => ({ ...current, password: undefined }))
            }}
            placeholder="Tạo mật khẩu"
            className={`${inputClass(errors.password)} pr-11`}
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

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
          Xác nhận mật khẩu
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.75}
          />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              if (errors.confirmPassword) {
                setErrors((current) => ({ ...current, confirmPassword: undefined }))
              }
            }}
            placeholder="Xác nhận mật khẩu"
            className={inputClass(errors.confirmPassword)}
          />
        </div>
        {errors.confirmPassword ? (
          <p className="text-sm text-red-500">{errors.confirmPassword}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="h-10 w-full rounded-xl bg-linear-to-r from-blue-600 to-emerald-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {registerMutation.isPending ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </button>

      <p className="text-center text-sm text-slate-600">
        Đã có tài khoản?{' '}
        <Link to={ROUTES.login} className="font-medium text-blue-600 transition hover:text-blue-700">
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
