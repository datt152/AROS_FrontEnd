import type { PracticeStatus } from '../types/practice.types'

export const PRACTICE_STATUS_BADGE_CLASS: Record<PracticeStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  UPCOMING: 'bg-sky-50 text-sky-800',
  ONGOING: 'bg-emerald-50 text-emerald-800',
  COMPLETED: 'bg-violet-50 text-violet-800',
  CLOSED: 'bg-red-50 text-red-700',
}
