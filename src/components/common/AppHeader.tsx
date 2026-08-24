import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../routes/routes.config'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to={ROUTES.home} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-emerald-600 text-white shadow-sm shadow-blue-600/20">
            <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight text-slate-900">AROS</span>
            <span className="block text-[11px] font-medium text-slate-500">Learning Platform</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to={ROUTES.login}
            className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Login
          </Link>
          <Link
            to={ROUTES.register}
            className="rounded-xl bg-linear-to-r from-blue-600 to-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-emerald-700"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  )
}
