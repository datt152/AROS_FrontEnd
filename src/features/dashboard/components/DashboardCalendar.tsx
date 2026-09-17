import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { resolveCalendarEventPath } from '../lib/dashboardLinks'
import type { DashboardCalendarEvent } from '../types/dashboard.types'
import {
  DASHBOARD_KIND_DOT,
  DASHBOARD_KIND_LABEL,
  DASHBOARD_PHASE_CLASS,
  DASHBOARD_PHASE_LABEL,
  addDays,
  formatMonthLabel,
  startOfMonth,
  startOfWeek,
  toDateKeyFromDate,
} from '../types/dashboard.types'

type DashboardCalendarProps = {
  events: DashboardCalendarEvent[]
  todayKey: string
  anchor: Date
  onAnchorChange: (next: Date) => void
  isFetching?: boolean
  /** Override deep-link (teacher vs student). */
  resolveEventPath?: (event: DashboardCalendarEvent) => string
  resolveEventState?: (event: DashboardCalendarEvent) => unknown
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function DashboardCalendar({
  events,
  todayKey,
  anchor,
  onAnchorChange,
  isFetching = false,
  resolveEventPath = resolveCalendarEventPath,
  resolveEventState,
}: DashboardCalendarProps) {
  const [selectedKey, setSelectedKey] = useState(todayKey)

  const eventsByDate = useMemo(() => {
    const map = new Map<string, DashboardCalendarEvent[]>()
    for (const event of events) {
      const list = map.get(event.date) ?? []
      list.push(event)
      map.set(event.date, list)
    }
    return map
  }, [events])

  const monthCells = useMemo(() => {
    const monthStart = startOfMonth(anchor)
    const gridStart = startOfWeek(monthStart)
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  }, [anchor])

  const selectedEvents = eventsByDate.get(selectedKey) ?? []

  function shift(amount: number) {
    const next = new Date(anchor)
    next.setMonth(next.getMonth() + amount)
    onAnchorChange(next)
  }

  function goToday() {
    onAnchorChange(new Date())
    setSelectedKey(todayKey)
  }

  return (
    <section className="relative flex h-[40rem] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {isFetching ? (
        <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
          Đang tải…
        </div>
      ) : null}

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Lịch kỳ thi</h2>
          <p className="mt-0.5 text-xs text-slate-500">Theo tháng · {formatMonthLabel(anchor)}</p>
        </div>
        <div className="inline-flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Tháng trước"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <Button type="button" variant="ghost" className="h-8 px-3 text-xs" onClick={goToday}>
            Hôm nay
          </Button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Tháng sau"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex shrink-0 flex-wrap gap-3 text-[11px] text-slate-500">
        {(
          [
            ['ONLINE', 'Trực tuyến'],
            ['OMR', 'OMR'],
            ['PRACTICE', 'Luyện tập'],
          ] as const
        ).map(([kind, label]) => (
          <span key={kind} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${DASHBOARD_KIND_DOT[kind]}`} />
            {label}
          </span>
        ))}
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-[90%] grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-1 py-1 text-center text-[10px] font-semibold uppercase text-slate-400"
            >
              {label}
            </div>
          ))}
          {monthCells.map((day) => {
            const key = toDateKeyFromDate(day)
            const inMonth = day.getMonth() === anchor.getMonth()
            const dayEvents = eventsByDate.get(key) ?? []
            const isToday = key === todayKey
            const isSelected = key === selectedKey
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={`min-h-14 rounded-lg border p-1 text-left transition ${
                  isSelected
                    ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100'
                    : isToday
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : inMonth
                        ? 'border-slate-100 bg-white hover:border-slate-300'
                        : 'border-transparent bg-slate-50/40 text-slate-400'
                }`}
              >
                <p className={`text-[11px] font-semibold ${isToday ? 'text-emerald-700' : ''}`}>
                  {day.getDate()}
                </p>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className={`h-1.5 w-1.5 rounded-full ${DASHBOARD_KIND_DOT[event.kind]}`}
                      title={event.title}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex max-h-36 min-h-[16rem] shrink-0 flex-col border-t border-slate-100 pt-3">
        <p className="shrink-0 text-xs font-semibold text-slate-700">
          Chi tiết ngày {selectedKey.split('-').reverse().join('/')}
        </p>
        {selectedEvents.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Không có kỳ thi trong ngày này.</p>
        ) : (
          <ul className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {selectedEvents.map((event) => (
              <li key={event.id}>
                <Link
                  to={resolveEventPath(event)}
                  state={resolveEventState?.(event)}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{event.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {DASHBOARD_KIND_LABEL[event.kind]} · {event.subjectName}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${DASHBOARD_PHASE_CLASS[event.phase]}`}
                  >
                    {DASHBOARD_PHASE_LABEL[event.phase]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
