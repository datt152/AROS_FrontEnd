import type { ExamMode, ExamStatus } from '../types/exam.types'
import type { StudentExamStatus, StudentMyStatus } from '../types/studentExam.types'

export const EXAM_MODE_BADGE_CLASS: Record<ExamMode, string> = {
  ONLINE: 'bg-sky-50 text-sky-700',
  OMR_PAPER: 'bg-violet-50 text-violet-700',
}

export const EXAM_STATUS_BADGE_CLASS: Record<ExamStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  UPCOMING: 'bg-sky-50 text-sky-700',
  ONGOING: 'bg-emerald-50 text-emerald-700',
  COMPLETED: 'bg-violet-50 text-violet-700',
  CLOSED: 'bg-red-50 text-red-700',
}

export const STUDENT_EXAM_STATUS_BADGE: Record<StudentExamStatus, string> = {
  UPCOMING: 'bg-sky-50 text-sky-800 border-sky-200',
  ONGOING: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  CLOSED: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const STUDENT_MY_STATUS_BADGE: Record<StudentMyStatus, string> = {
  NOT_STARTED: 'bg-amber-50 text-amber-800 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200',
  SUBMITTED: 'bg-violet-50 text-violet-800 border-violet-200',
}
