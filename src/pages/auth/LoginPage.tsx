import { useState } from 'react'
import { BookOpen, Eye, EyeOff, GraduationCap, Lock, User } from 'lucide-react'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/70 to-emerald-50/50 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-slate-50 via-blue-50/70 to-emerald-50/50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[12%] top-[6%] h-[min(42vw,28rem)] w-[min(42vw,28rem)] rounded-full bg-blue-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] bottom-[4%] h-[min(48vw,32rem)] w-[min(48vw,32rem)] rounded-full bg-emerald-200/35 blur-3xl"
      />

      <div className="relative z-10 grid h-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-2xl shadow-blue-900/5 backdrop-blur-xl sm:max-w-lg lg:h-[70dvh] lg:max-w-5xl lg:grid-cols-[1.05fr_1fr] xl:max-w-6xl">
        <section className="hidden h-full flex-col justify-between bg-linear-to-br from-blue-600 via-blue-700 to-emerald-600 p-8 text-white lg:flex xl:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">AROS Platform</p>
              <p className="text-base font-semibold tracking-tight">Learning Management</p>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-snug tracking-tight">
              Learn smarter.
              <br />
              Teach with clarity.
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-blue-100/90">
              A focused workspace for students and teachers — exams, practice, and progress in one
              place.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <BookOpen className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="text-sm text-blue-50/95">
              Structured for education — simple tools, clear outcomes.
            </p>
          </div>
        </section>

        <section className="flex h-full flex-col justify-center px-6 py-7 sm:px-8 lg:px-10 xl:px-12">
          <div className="mb-6 lg:hidden">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  AROS Platform
                </p>
                <p className="text-base font-semibold text-slate-900">Sign in to continue</p>
              </div>
            </div>
          </div>

          <div className="mb-5 hidden lg:block">
            <p className="text-sm font-medium text-blue-600">Welcome back</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Sign in to your account
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your credentials to access your classroom.
            </p>
          </div>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={1.75}
                />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your email"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
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
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="h-10 w-full rounded-xl bg-linear-to-r from-blue-600 to-emerald-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Sign in
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
