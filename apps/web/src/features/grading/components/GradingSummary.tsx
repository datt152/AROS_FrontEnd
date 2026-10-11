import type { GradingSummaryCounts } from '../types/grading.types'

type GradingSummaryProps = {
  counts: GradingSummaryCounts
}

const chips: { key: keyof GradingSummaryCounts; label: string; className: string }[] = [
  { key: 'total', label: 'Tổng SV', className: 'border-slate-200 bg-slate-50 text-slate-700' },
  { key: 'submitted', label: 'Đã nộp', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { key: 'inProgress', label: 'Đang làm', className: 'border-amber-200 bg-amber-50 text-amber-800' },
  { key: 'expired', label: 'Hết giờ', className: 'border-red-200 bg-red-50 text-red-700' },
  { key: 'notStarted', label: 'Chưa làm', className: 'border-slate-200 bg-white text-slate-600' },
]

export function GradingSummary({ counts }: GradingSummaryProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <div
          key={chip.key}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${chip.className}`}
        >
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">{chip.label}</span>
          <span className="font-semibold tabular-nums">{counts[chip.key]}</span>
        </div>
      ))}
    </div>
  )
}
