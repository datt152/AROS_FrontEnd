import { ArrowRight, BookOpen, CircleDot, ClipboardList, Play, Trophy } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'

import {
  resolveStudentActionNavigation,
  studentActionLabel,
} from '../lib/studentDashboardLinks'
import type { DashboardActivityItem } from '@aros/shared/features/dashboard/types/dashboard.types'
import type {
  StudentDashboardAction,
  StudentDashboardActionType,
} from '@aros/shared/features/dashboard/types/studentDashboard.types'
import { STUDENT_ACTION_PRIORITY_LABEL } from '@aros/shared/features/dashboard/types/studentDashboard.types'
import { STUDENT_ACTION_PRIORITY_CLASS } from './dashboardStyles'

const actionIconByType: Record<
  StudentDashboardActionType,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  CONTINUE_EXAM: Play,
  CONTINUE_PRACTICE: Play,
  UPCOMING_EXAM: ClipboardList,
  OPEN_PRACTICE: BookOpen,
  VIEW_RESULT: Trophy,
}

type StudentAgendaPanelProps = {
  actions: StudentDashboardAction[]
  recentResults: DashboardActivityItem[]
}

export function StudentAgendaPanel({ actions, recentResults }: StudentAgendaPanelProps) {
  const isEmpty = actions.length === 0

  return (
    <section className="flex h-auto flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Việc cần làm</h2>
          <p className="mt-0.5 text-xs text-slate-500">Bài làm và lịch sắp tới</p>
        </div>
        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {actions.length} mục
        </span>
      </div>

      <div
        className={`mt-3 min-h-[8.5rem] max-h-[28rem] overflow-y-auto overscroll-contain ${
          isEmpty ? 'flex items-center justify-center' : ''
        }`}
      >
        {isEmpty ? (
          <p className="text-center text-sm text-slate-400">Không có việc cần xử lý.</p>
        ) : (
          <ul className="space-y-2">
            {actions.map((item) => {
              const Icon = actionIconByType[item.type]
              const nav = resolveStudentActionNavigation(item)
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} />
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${STUDENT_ACTION_PRIORITY_CLASS[item.priority]}`}
                    >
                      {STUDENT_ACTION_PRIORITY_LABEL[item.priority]}
                    </span>
                  </div>
                  {item.detail ? (
                    <p className="mt-1 pl-6 text-xs leading-relaxed text-slate-500">{item.detail}</p>
                  ) : null}
                  <Link
                    to={nav.to}
                    state={nav.state}
                    className="mt-2 inline-flex items-center gap-1 pl-6 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    {studentActionLabel(item)}
                    <ArrowRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {recentResults.length > 0 ? (
        <div className="mt-3 max-h-36 shrink-0 overflow-y-auto border-t border-slate-100 pt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Kết quả gần đây
          </h3>
          <ul className="mt-2 space-y-3">
            {recentResults.map((item) => (
              <li key={item.id} className="flex gap-2.5">
                <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">{item.message}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {formatActivityTime(item.occurredAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function formatActivityTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
