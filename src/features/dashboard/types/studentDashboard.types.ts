import type {
  DashboardActivityItem,
  DashboardCalendarEvent,
  DashboardStatCard,
} from './dashboard.types'

export type StudentDashboardActionType =
  | 'CONTINUE_EXAM'
  | 'CONTINUE_PRACTICE'
  | 'UPCOMING_EXAM'
  | 'OPEN_PRACTICE'
  | 'VIEW_RESULT'

export type StudentDashboardActionPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export type StudentDashboardStats = {
  inProgressCount: number
  upcomingExamCount: number
  openPracticeCount: number
  recentSubmittedCount: number
}

export type StudentDashboardAction = {
  id: string
  type: StudentDashboardActionType
  priority: StudentDashboardActionPriority
  title: string
  detail: string
  /** Exam / practice / submission id */
  entityId: number
  classroomId?: number | null
  actionPath?: string | null
  actionLabel?: string | null
}

export type StudentDashboardData = {
  generatedAt: string
  stats: StudentDashboardStats
  actions: StudentDashboardAction[]
  recentResults: DashboardActivityItem[]
  calendarEvents: DashboardCalendarEvent[]
}

export const STUDENT_ACTION_PRIORITY_CLASS: Record<StudentDashboardActionPriority, string> = {
  HIGH: 'bg-rose-50 text-rose-700',
  MEDIUM: 'bg-amber-50 text-amber-800',
  LOW: 'bg-slate-100 text-slate-600',
}

export const STUDENT_ACTION_PRIORITY_LABEL: Record<StudentDashboardActionPriority, string> = {
  HIGH: 'Ưu tiên cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
}

export const STUDENT_ACTION_LABEL: Record<StudentDashboardActionType, string> = {
  CONTINUE_EXAM: 'Tiếp tục làm',
  CONTINUE_PRACTICE: 'Tiếp tục luyện',
  UPCOMING_EXAM: 'Xem bài thi',
  OPEN_PRACTICE: 'Vào luyện tập',
  VIEW_RESULT: 'Xem kết quả',
}

export function mapStudentStatsToCards(stats: StudentDashboardStats): DashboardStatCard[] {
  return [
    {
      id: 'inProgress',
      label: 'Đang làm',
      value: stats.inProgressCount,
      hint: 'Bài chưa nộp — tiếp tục làm',
      tone: 'rose',
    },
    {
      id: 'upcoming',
      label: 'Sắp thi',
      value: stats.upcomingExamCount,
      hint: 'Kỳ thi sắp diễn ra hoặc đang mở',
      tone: 'blue',
    },
    {
      id: 'openPractice',
      label: 'Luyện tập mở',
      value: stats.openPracticeCount,
      hint: 'Bài luyện tập có thể làm ngay',
      tone: 'emerald',
    },
    {
      id: 'recentSubmitted',
      label: 'Đã nộp gần đây',
      value: stats.recentSubmittedCount,
      hint: 'Bài đã nộp trong 7 ngày',
      tone: 'slate',
    },
  ]
}
