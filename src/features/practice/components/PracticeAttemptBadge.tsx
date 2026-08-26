import { formatMaxAttempts } from '../types/practice.types'

type PracticeAttemptBadgeProps = {
  attemptNo: number
  maxAttempts: number | null
}

export function PracticeAttemptBadge({ attemptNo, maxAttempts }: PracticeAttemptBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
      Lần {attemptNo}
      <span className="mx-1 text-slate-300">/</span>
      {formatMaxAttempts(maxAttempts)}
    </span>
  )
}
