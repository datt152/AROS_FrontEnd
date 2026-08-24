import { useState } from 'react'
import { PanelLeft } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { AppFooter } from '../components/common/AppFooter'
import { AppSidebar } from '../components/common/AppSidebar'

export function StudentLayout() {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-1">
        <AppSidebar
          role="student"
          isDesktopCollapsed={isDesktopCollapsed}
          onToggleDesktop={() => setIsDesktopCollapsed((current) => !current)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
        <main className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-slate-900 lg:hidden"
                aria-label="Open sidebar"
              >
                <PanelLeft className="h-4.5 w-4.5" strokeWidth={1.75} />
              </button>
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-900">Student Workspace</p>
                <p className="text-xs text-slate-500">Take exams and follow your progress</p>
              </div>
            </div>
          </header>
          <section className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </section>
        </main>
      </div>
      <AppFooter />
    </div>
  )
}
