import { Link } from 'react-router-dom'

import { ROUTES } from '../../routes/routes.config'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to={ROUTES.home} className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Logo AROS" className="h-8 w-8 shrink-0 object-contain" />
          <img src="/aros.png" alt="AROS" className="h-5 w-auto object-contain" />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to={ROUTES.login}
            className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Đăng nhập
          </Link>
          <Link
            to={ROUTES.register}
            className="rounded-xl bg-linear-to-r from-blue-600 to-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-emerald-700"
          >
            Đăng ký
          </Link>
        </nav>
      </div>
    </header>
  )
}
