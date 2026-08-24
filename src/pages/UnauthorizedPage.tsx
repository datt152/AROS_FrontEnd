import { ArrowLeft, ShieldOff } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../routes/routes.config'

export function UnauthorizedPage() {
  return (
    <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30">
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
          <ShieldOff className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>

        <h1 className="mt-8 text-7xl font-bold tracking-tight text-slate-900 sm:text-8xl">403</h1>
        <p className="mt-4 text-lg font-medium text-slate-700">Access Denied</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
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
