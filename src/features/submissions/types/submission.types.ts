export type SubmissionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'EXPIRED' | 'SUBMITTED'

export type ExamPurpose = 'EXAM' | 'PRACTICE'

export type PurposeFilter = 'ALL' | ExamPurpose

export type StudentSubmissionItem = {
  submissionId: number
  examId: number
  examTitle: string
  classroomId?: number | null
  classroomName?: string | null
  purpose: ExamPurpose
  versionCode: string | null
  attemptNo: number
  status: SubmissionStatus
  score: number | null
  maxScore: number | null
  scoreVisible: boolean
  startTime: string
  submitTime: string | null
}

export type StudentSubmissionDetailItem = {
  questionId: number
  order: number
  content: string
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
  selectedAnswer: string | null
  correctAnswer: string | null
  isCorrect: boolean | null
}

export type StudentSubmissionDetail = {
  submissionId: number
  examId: number
  examTitle: string
  classroomId?: number | null
  classroomName?: string | null
  purpose: ExamPurpose
  versionCode: string | null
  attemptNo: number
  status: SubmissionStatus
  score: number | null
  maxScore: number | null
  scoreVisible: boolean
  correctQuestions: number | null
  totalQuestions: number | null
  startTime: string
  submitTime: string | null
  details: StudentSubmissionDetailItem[]
}

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  NOT_STARTED: 'Chưa làm',
  IN_PROGRESS: 'Đang làm dở',
  EXPIRED: 'Hết giờ (chưa nộp)',
  SUBMITTED: 'Đã nộp',
}

export const SUBMISSION_STATUS_BADGE: Record<SubmissionStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-600 border-slate-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-800 border-amber-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200',
  SUBMITTED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
}

export const PURPOSE_LABEL: Record<ExamPurpose, string> = {
  EXAM: 'Bài thi',
  PRACTICE: 'Luyện tập',
}

export const PURPOSE_BADGE: Record<ExamPurpose, string> = {
  EXAM: 'bg-blue-50 text-blue-800 border-blue-200',
  PRACTICE: 'bg-violet-50 text-violet-800 border-violet-200',
}

export function formatSubmissionDateTime(value: string | null | undefined) {
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

export function formatSubmissionScore(score: number, maxScore: number) {
  return `${score.toFixed(2)} / ${maxScore.toFixed(2)}`
}

export type SubmissionListScoreDisplay = {
  text: string
  locked: boolean
}

export function getSubmissionListScoreDisplay(item: StudentSubmissionItem): SubmissionListScoreDisplay {
  if (item.status !== 'SUBMITTED') return { text: '—', locked: false }
  if (!item.scoreVisible) return { text: 'Điểm chưa công bố', locked: true }
  if (item.score == null || item.maxScore == null) return { text: '—', locked: false }
  return { text: `${item.score.toFixed(2)}/${item.maxScore.toFixed(2)}`, locked: false }
}

export function canResumeSubmission(item: Pick<StudentSubmissionItem, 'status'>) {
  return item.status === 'IN_PROGRESS'
}

export type SubmissionDetailLocationState = {
  purpose?: ExamPurpose
}
