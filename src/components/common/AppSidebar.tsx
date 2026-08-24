import type { ComponentType } from 'react'
import { BookOpen, ChevronRight, ClipboardCheck, FileText, GraduationCap, LogOut, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useLogout } from '../../features/auth/hooks/useLogout'
import { MENU_BY_ROLE, type Role } from '../../routes/routes.config'

type AppSidebarProps = {
  role: Role
  isDesktopCollapsed: boolean
  onToggleDesktop: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

const iconByLabel: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Dashboard: GraduationCap,
  Exams: FileText,
  Practice: BookOpen,
  History: ClipboardCheck,
  Grading: ClipboardCheck,
  'Question Bank': BookOpen,
  'Create Exam': FileText,
  'OMR Upload': FileText,
  'Create Practice': FileText,
  'Exam Stats': ClipboardCheck,
}

function NavItems({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1.5 px-3 pt-4">
      {MENU_BY_ROLE[role].map((item) => {
        const Icon = iconByLabel[item.label] ?? FileText
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-linear-to-r from-blue-600 to-emerald-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

function LogoutRow({ onNavigate }: { onNavigate?: () => void }) {
  const logoutMutation = useLogout()

  return (
    <div className="border-t border-slate-200 p-3">
      <button
        type="button"
        disabled={logoutMutation.isPending}
        onClick={() => {
          onNavigate?.()
          logoutMutation.mutate()
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-70"
      >
        <LogOut className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate">{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}</span>
      </button>
    </div>
  )
}

export function AppSidebar({
  role,
  isDesktopCollapsed,
  onToggleDesktop,
  isMobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  return (
    <>
      {isDesktopCollapsed ? (
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={onToggleDesktop}
            className="absolute left-0 top-15 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-600/30 transition hover:scale-105 hover:shadow-xl hover:shadow-blue-600/40"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">AROS</p>
              <p className="text-xs text-slate-500 capitalize">{role} workspace</p>
            </div>
            <button
              type="button"
              onClick={onToggleDesktop}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:text-slate-900"
              aria-label="Collapse sidebar"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            <NavItems role={role} />
          </div>
          <LogoutRow />
        </aside>
      )}

      {isMobileOpen ? <div className="fixed inset-0 z-40 bg-slate-900/45 lg:hidden" onClick={onCloseMobile} aria-hidden /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">AROS</p>
            <p className="text-xs text-slate-500 capitalize">{role} workspace</p>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:text-slate-900"
            aria-label="Close sidebar"
          >
            <X className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <NavItems role={role} onNavigate={onCloseMobile} />
        </div>
        <LogoutRow onNavigate={onCloseMobile} />
      </aside>
    </>
  )
}
