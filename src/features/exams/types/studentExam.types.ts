export type StudentExamStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CLOSED'

export type StudentMyStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'EXPIRED' | 'SUBMITTED'

export type StudentExamListItem = {
  id: number
  title: string
  duration: number
  totalQuestions: number
  maxScore: number
  startAt: string | null
  endAt: string | null
  examStatus: StudentExamStatus
  myStatus: StudentMyStatus
  /** true chỉ khi lịch/status cho phép làm (đóng/hết hạn/DRAFT → false) */
  canTake: boolean
  /** false = không countdown (thường PRACTICE) */
  timeLimitEnabled: boolean
  /** Cấu hình đề / response cho phép SV xem điểm */
  showScoreToStudent: boolean
  /** Điểm SV (chỉ có khi đã nộp; null nếu chưa có hoặc không trả) */
  myScore: number | null
}

/** Truyền qua router state — không gắn examId lên URL */
export type TakeExamLocationState = {
  examId: number
}

export const STUDENT_EXAM_STATUS_LABEL: Record<StudentExamStatus, string> = {
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
  CLOSED: 'Đã đóng',
}

export const STUDENT_EXAM_STATUS_BADGE: Record<StudentExamStatus, string> = {
  UPCOMING: 'bg-sky-50 text-sky-800 border-sky-200',
  ONGOING: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  CLOSED: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const STUDENT_MY_STATUS_LABEL: Record<StudentMyStatus, string> = {
  NOT_STARTED: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  EXPIRED: 'Hết hạn',
  SUBMITTED: 'Đã nộp',
}

export const STUDENT_MY_STATUS_BADGE: Record<StudentMyStatus, string> = {
  NOT_STARTED: 'bg-amber-50 text-amber-800 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200',
  SUBMITTED: 'bg-violet-50 text-violet-800 border-violet-200',
}

export function formatStudentExamSchedule(startAt: string | null, endAt: string | null) {
  if (!startAt && !endAt) return 'Chưa có lịch'
  const dateFmt = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const timeFmt = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  if (startAt && endAt) {
    const start = new Date(startAt)
    const end = new Date(endAt)
    return `${dateFmt.format(start)} · ${timeFmt.format(start)} – ${timeFmt.format(end)}`
  }
  if (startAt) {
    const start = new Date(startAt)
    return `${dateFmt.format(start)} · ${timeFmt.format(start)}`
  }
  const end = new Date(endAt!)
  return `Đến ${dateFmt.format(end)} · ${timeFmt.format(end)}`
}

export function getStudentTakeBlockReason(exam: StudentExamListItem): string | null {
  if (exam.canTake) return null
  if (exam.myStatus === 'SUBMITTED') return 'Bạn đã nộp bài'
  if (exam.myStatus === 'EXPIRED') return 'Đã hết thời gian làm bài'
  if (exam.examStatus === 'UPCOMING') return 'Chưa đến giờ mở đề'
  if (exam.examStatus === 'CLOSED') return 'Đề đã đóng'
  if (exam.examStatus === 'COMPLETED') return 'Kỳ thi đã kết thúc'
  return 'Không thể vào làm bài'
}

/** Hiện điểm trên card khi đã nộp và đề cho xem điểm */
export function canShowStudentScoreOnCard(exam: StudentExamListItem): boolean {
  return (
    exam.myStatus === 'SUBMITTED' &&
    exam.showScoreToStudent &&
    exam.myScore !== null &&
    Number.isFinite(exam.myScore)
  )
}

export function formatStudentScore(score: number, maxScore: number) {
  const scoreText = Number.isInteger(score) ? String(score) : score.toFixed(2)
  const maxText = Number.isInteger(maxScore) ? String(maxScore) : maxScore.toFixed(2)
  return `${scoreText}/${maxText}`
}
