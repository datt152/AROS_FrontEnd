import type { ExamPurpose, SubmissionStatus } from '@aros/shared/features/submissions/types/submission.types'

export const SUBMISSION_STATUS_BADGE: Record<SubmissionStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-600 border-slate-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-800 border-amber-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200',
  SUBMITTED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
}

export const PURPOSE_BADGE: Record<ExamPurpose, string> = {
  EXAM: 'bg-blue-50 text-blue-800 border-blue-200',
  PRACTICE: 'bg-violet-50 text-violet-800 border-violet-200',
}
