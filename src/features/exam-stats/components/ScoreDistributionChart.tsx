import type { ScoreDistributionBucket } from '../types/examStats.types'

type ScoreDistributionChartProps = {
  buckets: ScoreDistributionBucket[]
  submittedCount: number
}

export function ScoreDistributionChart({ buckets, submittedCount }: ScoreDistributionChartProps) {
  if (submittedCount === 0 || buckets.every((bucket) => bucket.count === 0)) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">Chưa có bài nộp</p>
        <p className="mt-1 text-sm text-slate-500">Phân bố điểm sẽ hiện khi có ít nhất một bài đã nộp.</p>
      </div>
    )
  }

  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Phân bố điểm</h2>
          <p className="mt-0.5 text-xs text-slate-500">Số sinh viên theo khoảng điểm</p>
        </div>
      </div>

      <div className="mt-6 flex h-48 items-end gap-2 sm:gap-3">
        {buckets.map((bucket) => {
          const heightPercent = Math.max((bucket.count / maxCount) * 100, bucket.count > 0 ? 8 : 0)
          return (
            <div key={bucket.label} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative flex h-40 w-full items-end justify-center">
                <div
                  className="w-full max-w-12 rounded-t-lg bg-blue-500/90 transition group-hover:bg-blue-600"
                  style={{ height: `${heightPercent}%` }}
                  title={`${bucket.label}: ${bucket.count} SV · ${bucket.minInclusive} ≤ điểm < ${bucket.maxExclusive}`}
                />
                <span className="pointer-events-none absolute -top-6 whitespace-nowrap rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {bucket.label}: {bucket.count} SV
                </span>
              </div>
              <span className="truncate text-center text-[11px] font-medium text-slate-600 sm:text-xs">
                {bucket.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
