import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">AROS</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-500">Nền tảng học tập và kiểm tra trực tuyến</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
