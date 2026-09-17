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
  /** Điểm SV theo lớp đang xem (chỉ có khi đã nộp; null nếu chưa có hoặc không trả) */
  myScore: number | null
  classroomId?: number | null
  classroomName?: string | null
}

/** Truyền qua router state — không gắn examId lên URL */
export type TakeExamLocationState = {
  examId: number
  /** Bắt buộc để take/submit đúng điểm theo lớp */
  classroomId: number
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
  IN_PROGRESS: 'Đang làm bài',
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
  return `${score.toFixed(2)}/${maxScore.toFixed(2)}`
}

/**
 * Đồng bộ myStatus từ lịch sử nộp bài khi /exams/my chưa trả đúng IN_PROGRESS.
 * Ưu tiên: IN_PROGRESS > EXPIRED > SUBMITTED > NOT_STARTED (theo submission mới nhất cùng exam+lớp).
 */
export function mergeStudentExamsWithSubmissions(
  exams: StudentExamListItem[],
  submissions: Array<{
    examId: number
    classroomId?: number | null
    purpose: 'EXAM' | 'PRACTICE'
    status: StudentMyStatus
  }>,
  purpose: 'EXAM' | 'PRACTICE',
): StudentExamListItem[] {
  const statusRank: Record<StudentMyStatus, number> = {
    NOT_STARTED: 0,
    SUBMITTED: 1,
    EXPIRED: 2,
    IN_PROGRESS: 3,
  }

  const bestByKey = new Map<string, StudentMyStatus>()
  for (const item of submissions) {
    if (item.purpose !== purpose) continue
    if (item.status === 'NOT_STARTED') continue
    const key = `${item.examId}:${item.classroomId ?? ''}`
    const current = bestByKey.get(key)
    if (!current || statusRank[item.status] >= statusRank[current]) {
      bestByKey.set(key, item.status)
    }
  }

  return exams.map((exam) => {
    const key = `${exam.id}:${exam.classroomId ?? ''}`
    const keyNoClass = `${exam.id}:`
    const fromSub = bestByKey.get(key) ?? bestByKey.get(keyNoClass)
    if (!fromSub) return exam
    // Chỉ nâng trạng thái (không hạ SUBMITTED → NOT_STARTED)
    if (statusRank[fromSub] <= statusRank[exam.myStatus]) return exam
    const nextCanTake =
      fromSub === 'IN_PROGRESS'
        ? exam.examStatus === 'ONGOING' || exam.canTake
        : exam.canTake
    return {
      ...exam,
      myStatus: fromSub,
      canTake: fromSub === 'IN_PROGRESS' ? Boolean(nextCanTake) : exam.canTake,
    }
  })
}

export type StudentExamSortMode = 'priority' | 'date_desc' | 'date_asc'

const EXAM_STATUS_PRIORITY: Record<StudentExamStatus, number> = {
  ONGOING: 0,
  UPCOMING: 1,
  COMPLETED: 2,
  CLOSED: 3,
}

const MY_STATUS_PRIORITY: Record<StudentMyStatus, number> = {
  IN_PROGRESS: 0,
  NOT_STARTED: 1,
  SUBMITTED: 2,
  EXPIRED: 3,
}

function startTimeMs(exam: StudentExamListItem) {
  if (!exam.startAt) return 0
  const value = new Date(exam.startAt).getTime()
  return Number.isFinite(value) ? value : 0
}

/** Ưu tiên bài đang diễn ra / đang làm, rồi theo ngày. */
export function compareStudentExams(
  a: StudentExamListItem,
  b: StudentExamListItem,
  sortMode: StudentExamSortMode = 'priority',
) {
  if (sortMode === 'date_desc') return startTimeMs(b) - startTimeMs(a)
  if (sortMode === 'date_asc') return startTimeMs(a) - startTimeMs(b)

  const byExam = EXAM_STATUS_PRIORITY[a.examStatus] - EXAM_STATUS_PRIORITY[b.examStatus]
  if (byExam !== 0) return byExam
  const byMine = MY_STATUS_PRIORITY[a.myStatus] - MY_STATUS_PRIORITY[b.myStatus]
  if (byMine !== 0) return byMine
  if (a.examStatus === 'UPCOMING' || a.examStatus === 'ONGOING') {
    return startTimeMs(a) - startTimeMs(b)
  }
  return startTimeMs(b) - startTimeMs(a)
}

export function filterAndSortStudentExams(
  exams: StudentExamListItem[],
  options: {
    search?: string
    examStatus?: StudentExamStatus | ''
    myStatus?: StudentMyStatus | ''
    sortMode?: StudentExamSortMode
  },
) {
  const keyword = options.search?.trim().toLowerCase() ?? ''
  const filtered = exams.filter((exam) => {
    if (keyword && !exam.title.toLowerCase().includes(keyword)) return false
    if (options.examStatus && exam.examStatus !== options.examStatus) return false
    if (options.myStatus && exam.myStatus !== options.myStatus) return false
    return true
  })
  const sortMode = options.sortMode ?? 'priority'
  return filtered.slice().sort((a, b) => compareStudentExams(a, b, sortMode))
}
