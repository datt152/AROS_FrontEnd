import { BookOpen, GraduationCap } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-linear-to-br from-slate-50 via-blue-50/70 to-emerald-50/50 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
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

      <div className="relative z-10 grid h-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-2xl shadow-blue-900/5 backdrop-blur-xl sm:max-w-lg lg:min-h-[70dvh] lg:max-w-5xl lg:grid-cols-[1.05fr_1fr] xl:max-w-6xl">
        <section className="hidden min-h-full flex-col justify-between bg-linear-to-br from-blue-600 via-blue-700 to-emerald-600 p-8 text-white lg:flex xl:p-10">
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

        <section className="flex min-h-full flex-col justify-center px-6 py-7 sm:px-8 lg:px-10 xl:px-12">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
