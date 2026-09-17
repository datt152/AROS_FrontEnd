import type { ExamStatus } from '../../exams/types/exam.types'
import type { StudentMyStatus } from '../../exams/types/studentExam.types'

export type DashboardExamKind = 'ONLINE' | 'OMR' | 'PRACTICE'
export type DashboardExamPhase = 'UPCOMING' | 'ONGOING' | 'ENDING_SOON' | 'CLOSED'
export type DashboardTodoType =
  | 'MISSING_VERSIONS'
  | 'DRAFT_INCOMPLETE'
  | 'OMR_SHEETS_NEED_REVIEW'
export type DashboardTodoPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type DashboardEntityType = 'EXAM' | 'OMR_SHEET'

export type DashboardStats = {
  classroomCount: number
  subjectCount: number
  onlineExamCount: number
  onlineExamOngoingCount: number
  onlineExamUpcomingCount: number
  omrExamCount: number
  omrActiveSessionCount: number
  practiceCount: number
  practiceOpenCount: number
  questionCount: number
  questionAddedLast7Days: number
  templateCount: number
  pendingActionCount: number
}

export type DashboardCalendarEvent = {
  id: number
  title: string
  kind: DashboardExamKind
  phase: DashboardExamPhase
  /** YYYY-MM-DD */
  date: string
  startAt?: string | null
  endAt?: string | null
  subjectId?: number | null
  subjectName: string
  /** Student dashboard — lớp gắn đề (để deep-link take). */
  classroomId?: number | null
  classroomCount: number
  status: ExamStatus
  /** Student dashboard — trạng thái làm bài của SV. */
  myStatus?: StudentMyStatus | null
}

export type DashboardTodoItem = {
  id: string
  type: DashboardTodoType
  priority: DashboardTodoPriority
  title: string
  detail: string
  entityType: DashboardEntityType
  entityId: number
  actionPath?: string | null
}

export type DashboardActivityItem = {
  id: string
  occurredAt: string
  type: string
  message: string
  entityType?: string | null
  entityId?: number | null
}

export type TeacherDashboardData = {
  generatedAt?: string
  stats: DashboardStats
  todos: DashboardTodoItem[]
  activities: DashboardActivityItem[]
  calendarEvents: DashboardCalendarEvent[]
}

/** Presentation card — FE map từ stats.* */
export type DashboardStatCard = {
  id: string
  label: string
  value: number
  hint?: string
  tone: 'blue' | 'emerald' | 'amber' | 'slate' | 'rose'
}

export const DASHBOARD_KIND_LABEL: Record<DashboardExamKind, string> = {
  ONLINE: 'Trực tuyến',
  OMR: 'OMR',
  PRACTICE: 'Luyện tập',
}

export const DASHBOARD_PHASE_LABEL: Record<DashboardExamPhase, string> = {
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang mở',
  ENDING_SOON: 'Sắp kết thúc',
  CLOSED: 'Đã đóng',
}

export const DASHBOARD_PHASE_CLASS: Record<DashboardExamPhase, string> = {
  UPCOMING: 'bg-sky-50 text-sky-800 border-sky-200',
  ONGOING: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  ENDING_SOON: 'bg-amber-50 text-amber-900 border-amber-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
}

export const DASHBOARD_KIND_DOT: Record<DashboardExamKind, string> = {
  ONLINE: 'bg-blue-500',
  OMR: 'bg-violet-500',
  PRACTICE: 'bg-emerald-500',
}

export const DASHBOARD_PRIORITY_CLASS: Record<DashboardTodoPriority, string> = {
  HIGH: 'bg-rose-50 text-rose-700',
  MEDIUM: 'bg-amber-50 text-amber-800',
  LOW: 'bg-slate-100 text-slate-600',
}

export const DASHBOARD_PRIORITY_LABEL: Record<DashboardTodoPriority, string> = {
  HIGH: 'Ưu tiên cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
}

export function startOfWeek(date: Date) {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function addDays(date: Date, amount: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12)
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 12)
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date)
}

export function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toDateKeyFromDate(date: Date) {
  return toDateKey(date)
}

/** Khoảng from/to gửi API khi đổi tháng trên lịch. */
export function getDashboardRangeForAnchor(anchor: Date) {
  const monthStart = startOfMonth(anchor)
  const gridFrom = startOfWeek(monthStart)
  const gridTo = addDays(gridFrom, 41)
  return { from: toDateKey(gridFrom), to: toDateKey(gridTo) }
}

export function formatClockFromIso(iso?: string | null) {
  if (!iso) return undefined
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso))
  } catch {
    return undefined
  }
}

export function mapStatsToCards(stats: DashboardStats): DashboardStatCard[] {
  return [
    {
      id: 'classrooms',
      label: 'Lớp học',
      value: stats.classroomCount,
      tone: 'blue',
    },
    {
      id: 'subjects',
      label: 'Môn học',
      value: stats.subjectCount,
      tone: 'emerald',
    },
    {
      id: 'online',
      label: 'Kỳ thi online',
      value: stats.onlineExamCount,
      hint: `${stats.onlineExamOngoingCount} đang mở · ${stats.onlineExamUpcomingCount} sắp tới`,
      tone: 'blue',
    },
    {
      id: 'omr',
      label: 'Đề OMR',
      value: stats.omrExamCount,
      hint: `${stats.omrActiveSessionCount} phiên chấm đang chạy`,
      tone: 'amber',
    },
    {
      id: 'practice',
      label: 'Bài luyện tập',
      value: stats.practiceCount,
      hint: `${stats.practiceOpenCount} đang mở cho SV`,
      tone: 'emerald',
    },
    {
      id: 'templates',
      label: 'Đề mẫu',
      value: stats.templateCount,
      hint: 'Thư viện đề của bạn',
      tone: 'slate',
    },
    {
      id: 'pending',
      label: 'Chờ xử lý',
      value: stats.pendingActionCount,
      hint: 'Việc cần làm hôm nay',
      tone: 'rose',
    },
  ]
}
