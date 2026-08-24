import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
      <main className="w-full max-w-md p-6">
        <Outlet />
      </main>
    </div>
  )
}
