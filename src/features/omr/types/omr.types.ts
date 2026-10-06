export type ExamSessionStatus = 'OPEN' | 'CLOSED' | 'GRADED'

export type OmrSheetStatus =
  | 'PROCESSING'
  | 'GRADED'
  | 'NEEDS_REVIEW'
  | 'RETAKE_REQUIRED'
  | 'FAILED'

export type ExamSessionItem = {
  id: number
  examId: number
  examTitle: string
  classroomId: number
  classroomName: string
  name: string
  status: ExamSessionStatus
  createdAt: string
  sheetCount: number
}

export type OmrAnswerLevel = 'ok' | 'warning' | 'error' | 'empty'

export type OmrBubble = {
  choice: string
  x: number
  y: number
  w: number
  h: number
  tone?: string | null
}

export type OmrAnswerItem = {
  question: number
  chosen: string | null
  correctAnswer: string | null
  isCorrect: boolean | null
  status: string
  level: OmrAnswerLevel
  color: string | null
  bubble?: OmrBubble | null
  markedBubbles: OmrBubble[]
  overlayBubbles: OmrBubble[]
}

export type OmrSheetItem = {
  submissionId: number
  examSessionId: number
  examId: number
  status: OmrSheetStatus
  studentId: string | null
  matchedStudentId: number | null
  studentName: string | null
  examCode: string | null
  score: number | null
  maxScore: number | null
  warpedUrl: string | null
  originalImageUrl: string | null
  needReview: number[]
  answers: OmrAnswerItem[]
  gradedAt: string | null
}

/** Đề OMR — map từ GET /exams filter examMode === OMR_PAPER */
export type OmrExamCard = {
  id: number
  title: string
  subjectName: string
  versionCodes: string[]
  classroomCount: number
  totalQuestions: number
  status: string
}

export type CreateExamSessionPayload = {
  examId: number
  classroomId: number
  name: string
}

/** Map questionNumber → A|B|C|D — không rỗng; phiếu cần đã có examCode */
export type OmrSheetReviewPayload = {
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>
}

export const EXAM_SESSION_STATUS_LABEL: Record<ExamSessionStatus, string> = {
  OPEN: 'Đang mở',
  CLOSED: 'Đã khóa',
  GRADED: 'Đã kết thúc',
}

export const EXAM_SESSION_STATUS_BADGE: Record<ExamSessionStatus, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  GRADED: 'bg-blue-50 text-blue-700 border-blue-200',
}

export const OMR_SHEET_STATUS_LABEL: Record<OmrSheetStatus, string> = {
  PROCESSING: 'Đang xử lý',
  GRADED: 'Đã chấm',
  NEEDS_REVIEW: 'Cần xem lại',
  RETAKE_REQUIRED: 'Chụp lại',
  FAILED: 'Lỗi',
}

export const OMR_SHEET_STATUS_BADGE: Record<OmrSheetStatus, string> = {
  PROCESSING: 'bg-amber-50 text-amber-800 border-amber-200',
  GRADED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  NEEDS_REVIEW: 'bg-orange-50 text-orange-800 border-orange-200',
  RETAKE_REQUIRED: 'bg-red-50 text-red-700 border-red-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
}

export const OMR_ANSWER_LEVEL_LABEL: Record<OmrAnswerLevel, string> = {
  ok: 'Đúng',
  warning: 'Sai',
  error: 'Sai',
  empty: 'Sai',
}

/** Tô trùng = từ 2 overlay đỏ trở lên trên cùng 1 câu. */
export function omrAnswerListLabel(answer: {
  level: OmrAnswerLevel
  isCorrect: boolean | null
  chosen: string | null
  overlayBubbles?: { tone?: string | null }[]
  markedBubbles?: { choice: string }[]
}): 'Đúng' | 'Sai' | 'Tô trùng' {
  const redOverlayCount = (answer.overlayBubbles ?? []).filter(
    (b) => (b.tone ?? 'red').toLowerCase() === 'red',
  ).length
  const markedCount = new Set((answer.markedBubbles ?? []).map((b) => b.choice).filter(Boolean)).size
  if (redOverlayCount >= 2 || (redOverlayCount === 0 && markedCount >= 2)) {
    return 'Tô trùng'
  }
  if (answer.isCorrect === true) return 'Đúng'
  return 'Sai'
}

export const OMR_ANSWER_LEVEL_BADGE: Record<OmrAnswerLevel, string> = {
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  empty: 'bg-slate-100 text-slate-600 border-slate-200',
}

export type OmrSheetMatchIssues = {
  studentUnmatched: boolean
  examCodeMissing: boolean
  label: string | null
}

/** Phiếu NEEDS_REVIEW có thể chưa gắn được sinh viên hoặc chưa có mã đề. */
export function getOmrSheetMatchIssues(
  sheet: Pick<OmrSheetItem, 'status' | 'matchedStudentId' | 'examCode'>,
): OmrSheetMatchIssues {
  if (sheet.status === 'PROCESSING') {
    return { studentUnmatched: false, examCodeMissing: false, label: null }
  }
  const studentUnmatched = sheet.matchedStudentId == null
  const examCodeMissing = !sheet.examCode?.trim()
  const label =
    studentUnmatched && examCodeMissing
      ? 'Chưa khớp SV / mã đề'
      : studentUnmatched
        ? 'Chưa khớp SV'
        : examCodeMissing
          ? 'Chưa có mã đề'
          : null
  return { studentUnmatched, examCodeMissing, label }
}

export function formatOmrScore(score: number | null, maxScore: number | null) {
  if (score == null || maxScore == null) return '—'
  return `${score.toFixed(2)}/${maxScore.toFixed(2)}`
}

export function formatOmrDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Prefer warped image; originalImageUrl may be a server filesystem path. */
export function resolveOmrSheetImageUrl(sheet: Pick<OmrSheetItem, 'warpedUrl' | 'originalImageUrl'>) {
  const warped = sheet.warpedUrl?.trim()
  if (warped && /^https?:\/\//i.test(warped)) return warped
  if (warped && warped.startsWith('/')) return warped

  const original = sheet.originalImageUrl?.trim()
  if (original && /^https?:\/\//i.test(original)) return original
  if (original && original.startsWith('/')) return original
  return null
}
