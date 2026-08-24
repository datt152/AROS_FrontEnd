import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../routes/routes.config'

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200/80 bg-white/80 text-slate-600">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-emerald-600 text-white">
              <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-semibold text-slate-900">AROS Platform</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            A focused workspace for students and teachers — exams, practice, and progress in one
            place.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to={ROUTES.home} className="transition hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>
              <Link to={ROUTES.login} className="transition hover:text-blue-600">
                Login
              </Link>
            </li>
            <li>
              <Link to={ROUTES.register} className="transition hover:text-blue-600">
                Register
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">For classrooms</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Online exams</li>
            <li>OMR grading</li>
            <li>Practice & progress</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200/80">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-400 sm:px-6">
          © {year} AROS. Built for modern classrooms.
        </p>
      </div>
    </footer>
  )
}
