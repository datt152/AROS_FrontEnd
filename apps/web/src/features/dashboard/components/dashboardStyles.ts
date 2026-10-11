import type { DashboardExamKind, DashboardExamPhase, DashboardTodoPriority } from '../types/dashboard.types'
import type { StudentDashboardActionPriority } from '../types/studentDashboard.types'

export const DASHBOARD_PHASE_CLASS: Record<DashboardExamPhase, string> = {
  UPCOMING: 'bg-sky-50 text-sky-800 border-sky-200',
  ONGOING: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  ENDING_SOON: 'bg-amber-50 text-amber-900 border-amber-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
}

export const DASHBOARD_KIND_DOT: Record<DashboardExamKind, string> = {
  ONLINE: 'bg-blue-500',
  OMR: 'bg-violet-500',
  PRACTICE: 'bg-emerald-500',
}

export const DASHBOARD_PRIORITY_CLASS: Record<DashboardTodoPriority, string> = {
  HIGH: 'bg-rose-50 text-rose-700',
  MEDIUM: 'bg-amber-50 text-amber-800',
  LOW: 'bg-slate-100 text-slate-600',
}

export const STUDENT_ACTION_PRIORITY_CLASS: Record<StudentDashboardActionPriority, string> = {
  HIGH: 'bg-rose-50 text-rose-700',
  MEDIUM: 'bg-amber-50 text-amber-800',
  LOW: 'bg-slate-100 text-slate-600',
}
