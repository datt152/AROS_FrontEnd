import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../routes/routes.config'

export function NotFoundPage() {
  return (
    <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30">
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-600 shadow-lg shadow-blue-600/20">
          <FileQuestion className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>

        <h1 className="mt-8 text-7xl font-bold tracking-tight text-slate-900 sm:text-8xl">404</h1>
        <p className="mt-4 text-lg font-medium text-slate-700">Page not found</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to={ROUTES.home}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:shadow-lg hover:shadow-blue-600/30"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
