import type { ComponentType } from 'react'
import { useState } from 'react'
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  FileScan,
  FileText,
  GraduationCap,
  HelpCircle,
  Library,
  LogOut,
  PanelRight,
  UserRound,
  Users,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { AccountProfileModal } from '../../features/auth/components/AccountProfileModal'
import { useLogout } from '../../features/auth/hooks/useLogout'
import { MENU_BY_ROLE, ROUTES, type Role } from '../../routes/routes.config'

type AppSidebarProps = {
  role: Role
  isDesktopCollapsed: boolean
  onToggleDesktop: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

const iconByLabel: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  'Bảng điều khiển': GraduationCap,
  'Môn học': BookOpen,
  'Lớp học': Users,
  'Bài thi': FileText,
  'Luyện tập': BookOpen,
  'Lịch sử': ClipboardCheck,
  'Chấm điểm': ClipboardCheck,
  'Ngân hàng câu hỏi': HelpCircle,
  'Thư viện đề': Library,
  'Tạo bài thi': FileText,
  'Kỳ thi trực tuyến': FileText,
  'Đề OMR': FileScan,
  'Tải lên OMR': FileScan,
  'Chấm OMR': FileScan,
  'Bài luyện tập': BookOpen,
  'Tạo bài luyện tập': BookOpen,
  'Thống kê bài thi': ClipboardCheck,
  'Quản lý bài thi': FileText,
}

const workspaceLabel: Record<Role, string> = {
  teacher: 'Không gian giáo viên',
  student: 'Không gian sinh viên',
}

function NavItems({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav className="space-y-1.5 px-3 pt-4">
      {MENU_BY_ROLE[role].map((item) => {
        const Icon = iconByLabel[item.label] ?? FileText
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ROUTES.teacher.exams}
            onClick={onNavigate}
            className={({ isActive }) => {
              const gradeOmrActive =
                item.label === 'Chấm OMR' &&
                (pathname.startsWith('/teacher/omr/') || pathname === '/teacher/omr-upload')
              const manageOmrActive =
                item.label === 'Đề OMR' && pathname.startsWith('/teacher/exams/omr')
              const active = isActive || gradeOmrActive || manageOmrActive
              return `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-linear-to-r from-blue-600 to-emerald-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

function AccountActions({
  onNavigate,
  onOpenAccount,
}: {
  onNavigate?: () => void
  onOpenAccount: () => void
}) {
  const logoutMutation = useLogout()

  return (
    <div className="space-y-1 border-t border-slate-200 p-3">
      <button
        type="button"
        onClick={() => {
          onNavigate?.()
          onOpenAccount()
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <UserRound className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate">Tài khoản</span>
      </button>
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
        <span className="truncate">{logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
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
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  return (
    <>
      {isDesktopCollapsed ? (
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={onToggleDesktop}
            className="fixed left-0 top-15 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-600/30 transition hover:scale-105 hover:shadow-xl hover:shadow-blue-600/40"
            aria-label="Mở rộng thanh bên"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">AROS</p>
              <p className="text-xs text-slate-500">{workspaceLabel[role]}</p>
            </div>
            <button
              type="button"
              onClick={onToggleDesktop}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:text-slate-900"
              aria-label="Thu gọn thanh bên"
            >
              <PanelRight className="h-4.5 w-4.5" strokeWidth={1.75} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            <NavItems role={role} />
          </div>
          <AccountActions onOpenAccount={() => setIsAccountOpen(true)} />
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
            <p className="text-xs text-slate-500">{workspaceLabel[role]}</p>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:text-slate-900"
            aria-label="Đóng thanh bên"
          >
            <PanelRight className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <NavItems role={role} onNavigate={onCloseMobile} />
        </div>
        <AccountActions onNavigate={onCloseMobile} onOpenAccount={() => setIsAccountOpen(true)} />
      </aside>

      {isAccountOpen ? <AccountProfileModal onClose={() => setIsAccountOpen(false)} /> : null}
    </>
  )
}
