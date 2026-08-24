import { useState } from 'react'

type FieldErrors = {
  email?: string
  password?: string
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M3 3l18 18M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-1.17M9.88 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a18.45 18.45 0 0 1-4.06 5.12M6.12 6.12A18.45 18.45 0 0 0 2 12s3.5 7 10 7a10.94 10.94 0 0 0 3.24-.49"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Email không hợp lệ'
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    window.setTimeout(() => setLoading(false), 1200)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
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
          placeholder="name@example.com"
          className={`h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
            errors.email
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
          }`}
        />
        {errors.email ? <p className="text-sm text-red-500">{errors.email}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Mật khẩu
        </label>
        <div className="relative">
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
            placeholder="••••••••"
            className={`h-11 w-full rounded-lg border bg-white py-2 pl-3.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
              errors.password
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600"
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {errors.password ? <p className="text-sm text-red-500">{errors.password}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2">
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
        disabled={loading}
        className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Đang đăng nhập...
          </span>
        ) : (
          'Đăng nhập'
        )}
      </button>

      <p className="text-center text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <a href="#" className="font-medium text-blue-600 transition hover:text-blue-700">
          Đăng ký
        </a>
      </p>
    </form>
  )
}
