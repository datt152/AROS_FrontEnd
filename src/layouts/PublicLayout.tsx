import { Outlet } from 'react-router-dom'

import { AppFooter } from '../components/common/AppFooter'
import { AppHeader } from '../components/common/AppHeader'

export function PublicLayout() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-hidden bg-linear-to-br from-slate-50 via-blue-50/70 to-emerald-50/50 text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[12%] top-[8%] h-[min(42vw,28rem)] w-[min(42vw,28rem)] rounded-full bg-blue-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] top-[28%] h-[min(48vw,32rem)] w-[min(48vw,32rem)] rounded-full bg-emerald-200/35 blur-3xl"
      />
      <AppHeader />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <div className="relative z-10">
        <AppFooter />
      </div>
    </div>
  )
}
