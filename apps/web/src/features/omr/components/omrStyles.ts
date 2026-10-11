import type { ExamSessionStatus, OmrAnswerLevel, OmrSheetStatus } from '../types/omr.types'

export const EXAM_SESSION_STATUS_BADGE: Record<ExamSessionStatus, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  GRADED: 'bg-blue-50 text-blue-700 border-blue-200',
}

export const OMR_SHEET_STATUS_BADGE: Record<OmrSheetStatus, string> = {
  PROCESSING: 'bg-amber-50 text-amber-800 border-amber-200',
  GRADED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  NEEDS_REVIEW: 'bg-orange-50 text-orange-800 border-orange-200',
  RETAKE_REQUIRED: 'bg-red-50 text-red-700 border-red-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
}

export const OMR_ANSWER_LEVEL_BADGE: Record<OmrAnswerLevel, string> = {
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  empty: 'bg-slate-100 text-slate-600 border-slate-200',
}
