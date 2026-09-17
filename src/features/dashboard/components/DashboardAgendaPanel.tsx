import {
  ArrowRight,
  CircleDot,
  FileCode2,
  FileScan,
  FileWarning,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'

import { resolveTodoPath, todoActionLabel } from '../lib/dashboardLinks'
import type {
  DashboardActivityItem,
  DashboardTodoItem,
  DashboardTodoType,
} from '../types/dashboard.types'
import {
  DASHBOARD_PRIORITY_CLASS,
  DASHBOARD_PRIORITY_LABEL,
} from '../types/dashboard.types'

const todoIconByType: Record<
  DashboardTodoType,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  MISSING_VERSIONS: FileCode2,
  DRAFT_INCOMPLETE: FileWarning,
  OMR_SHEETS_NEED_REVIEW: FileScan,
}

type DashboardAgendaPanelProps = {
  todos: DashboardTodoItem[]
  activities: DashboardActivityItem[]
}

export function DashboardAgendaPanel({ todos, activities }: DashboardAgendaPanelProps) {
  const isEmpty = todos.length === 0

  return (
    <section className="flex h-auto flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Việc cần làm</h2>
          <p className="mt-0.5 text-xs text-slate-500">Ưu tiên xử lý hôm nay</p>
        </div>
        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {todos.length} mục
        </span>
      </div>

      {/* min ~2 card, max ~5 card rồi scroll — giống lịch tuần */}
      <div
        className={`mt-3 min-h-[8.5rem] max-h-[28rem] overflow-y-auto overscroll-contain ${
          isEmpty ? 'flex items-center justify-center' : ''
        }`}
      >
        {isEmpty ? (
          <p className="text-center text-sm text-slate-400">Không có việc cần xử lý.</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((item) => {
              const Icon = todoIconByType[item.type]
              const to = resolveTodoPath(item)
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
                      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${DASHBOARD_PRIORITY_CLASS[item.priority]}`}
                    >
                      {DASHBOARD_PRIORITY_LABEL[item.priority]}
                    </span>
                  </div>
                  {item.detail ? (
                    <p className="mt-1 pl-6 text-xs leading-relaxed text-slate-500">{item.detail}</p>
                  ) : null}
                  <Link
                    to={to}
                    className="mt-2 inline-flex items-center gap-1 pl-6 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    {todoActionLabel(item)}
                    <ArrowRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {activities.length > 0 ? (
        <div className="mt-3 max-h-36 shrink-0 overflow-y-auto border-t border-slate-100 pt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hoạt động gần đây
          </h3>
          <ul className="mt-2 space-y-3">
            {activities.map((item) => (
              <li key={item.id} className="flex gap-2.5">
                <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" strokeWidth={2} />
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
