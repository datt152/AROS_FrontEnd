export type GradingStudentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'EXPIRED' | 'SUBMITTED'

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'

export type GradingSubjectOption = {
  id: number
  subjectName: string
}

export type GradingClassroomOption = {
  id: number
  className: string
  subjectId: number
}

export type GradingExamOption = {
  id: number
  title: string
  status: string
  startAt?: string | null
  endAt?: string | null
  maxScore: number
  classroomIds: number[]
}

export type GradingStudentRow = {
  studentId: number
  fullName: string
  email: string
  studentCode: string
  status: GradingStudentStatus
  submissionId: number | null
  score: number | null
  versionCode: string | null
  startTime: string | null
  submitTime: string | null
}

export type GradingSheet = {
  examId: number
  examTitle: string
  classroomId: number
  classroomName: string
  maxScore: number
  students: GradingStudentRow[]
}

export type SubmissionDetailItem = {
  questionId: number
  order: number
  content: string
  type: QuestionType
  selectedAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
  rawPoint: number
}

export type SubmissionDetail = {
  submissionId: number
  examId: number
  examTitle: string
  versionCode: string
  studentId: number
  fullName: string
  email: string
  studentCode: string
  status: GradingStudentStatus
  score: number | null
  maxScore: number
  correctQuestions: number
  totalQuestions: number
  startTime: string | null
  submitTime: string | null
  details: SubmissionDetailItem[]
}

export type GradingSummaryCounts = {
  total: number
  submitted: number
  inProgress: number
  expired: number
  notStarted: number
}

export const GRADING_STATUS_LABEL: Record<GradingStudentStatus, string> = {
  NOT_STARTED: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  EXPIRED: 'Hết giờ / chưa nộp',
  SUBMITTED: 'Đã nộp',
}

export const GRADING_STATUS_BADGE_CLASS: Record<GradingStudentStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-amber-50 text-amber-800',
  EXPIRED: 'bg-red-50 text-red-700',
  SUBMITTED: 'bg-emerald-50 text-emerald-800',
}

export function formatGradingDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatScoreDisplay(score: number | null | undefined, maxScore: number, status: GradingStudentStatus) {
  if (status === 'EXPIRED' || status === 'NOT_STARTED' || status === 'IN_PROGRESS') return '—'
  if (score === null || score === undefined) return '—'
  return `${score.toFixed(2)}/${maxScore.toFixed(2)}`
}

export function canViewSubmission(student: GradingStudentRow) {
  return Boolean(student.submissionId) && student.status === 'SUBMITTED'
}

export function summarizeGradingStudents(students: GradingStudentRow[]): GradingSummaryCounts {
  return students.reduce(
    (acc, student) => {
      acc.total += 1
      if (student.status === 'SUBMITTED') acc.submitted += 1
      else if (student.status === 'IN_PROGRESS') acc.inProgress += 1
      else if (student.status === 'EXPIRED') acc.expired += 1
      else acc.notStarted += 1
      return acc
    },
    { total: 0, submitted: 0, inProgress: 0, expired: 0, notStarted: 0 },
  )
}
