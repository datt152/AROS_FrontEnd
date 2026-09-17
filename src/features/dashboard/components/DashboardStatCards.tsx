import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  FileScan,
  FileText,
  Library,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'

import type { DashboardStatCard } from '../types/dashboard.types'

const toneClass: Record<DashboardStatCard['tone'], string> = {
  blue: 'from-blue-50 to-white border-blue-100 text-blue-700',
  emerald: 'from-emerald-50 to-white border-emerald-100 text-emerald-700',
  amber: 'from-amber-50 to-white border-amber-100 text-amber-800',
  slate: 'from-slate-50 to-white border-slate-200 text-slate-700',
  rose: 'from-rose-50 to-white border-rose-100 text-rose-700',
}

const iconById: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  classrooms: Users,
  subjects: BookOpen,
  online: FileText,
  omr: FileScan,
  practice: BookOpen,
  templates: Library,
  pending: AlertCircle,
}

type DashboardStatCardsProps = {
  items: DashboardStatCard[]
}

export function DashboardStatCards({ items }: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => {
        const Icon = iconById[item.id] ?? ClipboardList
        return (
          <article
            key={item.id}
            className={`rounded-2xl border bg-linear-to-b p-3.5 shadow-sm ${toneClass[item.tone]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{item.label}</p>
              <Icon className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.75} />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
              {item.value}
            </p>
            <p className="mt-1 min-h-[2.25rem] line-clamp-2 text-[11px] leading-snug text-slate-500">
              {item.hint ?? '\u00A0'}
            </p>
          </article>
        )
      })}
    </div>
  )
}
