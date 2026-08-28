export function SubmissionHistorySkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-2/3 rounded-lg bg-slate-200" />
              <div className="h-4 w-1/2 rounded-lg bg-slate-100" />
              <div className="h-4 w-1/3 rounded-lg bg-slate-100" />
            </div>
            <div className="h-6 w-20 rounded-lg bg-slate-100" />
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="h-4 w-24 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
