import type { ExamStats } from '../types/examStats.types'
import { formatScoreMetric } from '../types/examStats.types'

type ExamStatsSummaryProps = {
  stats: ExamStats
}

const statusMetrics: {
  key: keyof Pick<
    ExamStats,
    'totalStudents' | 'submittedCount' | 'inProgressCount' | 'expiredCount' | 'notStartedCount'
  >
  label: string
  className: string
}[] = [
  { key: 'totalStudents', label: 'Tổng SV', className: 'border-slate-200 bg-slate-50 text-slate-700' },
  { key: 'submittedCount', label: 'Đã nộp', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { key: 'inProgressCount', label: 'Đang làm', className: 'border-amber-200 bg-amber-50 text-amber-800' },
  { key: 'expiredCount', label: 'Hết giờ', className: 'border-red-200 bg-red-50 text-red-700' },
  { key: 'notStartedCount', label: 'Chưa làm', className: 'border-slate-200 bg-white text-slate-600' },
]

const scoreMetrics: {
  key: 'averageScore' | 'highestScore' | 'lowestScore'
  label: string
}[] = [
  { key: 'averageScore', label: 'Điểm TB' },
  { key: 'highestScore', label: 'Cao nhất' },
  { key: 'lowestScore', label: 'Thấp nhất' },
]

export function ExamStatsSummary({ stats }: ExamStatsSummaryProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statusMetrics.map((metric) => (
        <div
          key={metric.key}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${metric.className}`}
        >
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">{metric.label}</span>
          <span className="font-semibold tabular-nums">{stats[metric.key]}</span>
        </div>
      ))}
      {scoreMetrics.map((metric) => (
        <div
          key={metric.key}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-blue-900"
        >
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">{metric.label}</span>
          <span className="font-semibold tabular-nums">{formatScoreMetric(stats[metric.key])}</span>
        </div>
      ))}
    </div>
  )
}
