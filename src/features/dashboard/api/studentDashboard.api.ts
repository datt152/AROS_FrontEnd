import { apiClient } from '../../../lib/axios'
import type { ExamStatus } from '../../exams/types/exam.types'
import type { StudentMyStatus } from '../../exams/types/studentExam.types'
import type {
  DashboardActivityItem,
  DashboardCalendarEvent,
  DashboardExamKind,
  DashboardExamPhase,
} from '../types/dashboard.types'
import type {
  StudentDashboardAction,
  StudentDashboardActionPriority,
  StudentDashboardActionType,
  StudentDashboardData,
  StudentDashboardStats,
} from '../types/studentDashboard.types'

export type GetStudentDashboardParams = {
  from: string
  to: string
}

type StudentStatsDto = Partial<StudentDashboardStats>

type StudentCalendarEventDto = {
  id?: number
  title?: string
  kind?: DashboardExamKind | string
  phase?: DashboardExamPhase | string
  date?: string
  startAt?: string | null
  endAt?: string | null
  subjectId?: number | null
  subjectName?: string | null
  classroomId?: number | null
  classroomCount?: number | null
  status?: ExamStatus | string
  myStatus?: StudentMyStatus | string | null
}

type StudentActionDto = {
  id?: string | number
  type?: StudentDashboardActionType | string
  priority?: StudentDashboardActionPriority | string
  title?: string
  detail?: string
  entityId?: number
  classroomId?: number | null
  actionPath?: string | null
  actionLabel?: string | null
}

type StudentRecentResultDto = {
  id?: string | number
  occurredAt?: string
  type?: string
  message?: string
  entityType?: string | null
  entityId?: number | null
}

type StudentDashboardDto = {
  generatedAt?: string
  stats?: StudentStatsDto
  actions?: StudentActionDto[]
  recentResults?: StudentRecentResultDto[]
  calendarEvents?: StudentCalendarEventDto[]
  data?: StudentDashboardDto
}

const EMPTY_STATS: StudentDashboardStats = {
  inProgressCount: 0,
  upcomingExamCount: 0,
  openPracticeCount: 0,
  recentSubmittedCount: 0,
}

function asNumber(value: unknown, fallback = 0) {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function unwrapDashboard(data: unknown): StudentDashboardDto {
  if (!data || typeof data !== 'object') return {}
  const root = data as StudentDashboardDto
  if (root.data && typeof root.data === 'object') return root.data
  return root
}

function isStudentKind(value: unknown): value is 'ONLINE' | 'PRACTICE' {
  return value === 'ONLINE' || value === 'PRACTICE'
}

function isPhase(value: unknown): value is DashboardExamPhase {
  return (
    value === 'UPCOMING' ||
    value === 'ONGOING' ||
    value === 'ENDING_SOON' ||
    value === 'CLOSED'
  )
}

function isExamStatus(value: unknown): value is ExamStatus {
  return (
    value === 'DRAFT' ||
    value === 'UPCOMING' ||
    value === 'ONGOING' ||
    value === 'COMPLETED' ||
    value === 'CLOSED'
  )
}

function isMyStatus(value: unknown): value is StudentMyStatus {
  return (
    value === 'NOT_STARTED' ||
    value === 'IN_PROGRESS' ||
    value === 'EXPIRED' ||
    value === 'SUBMITTED'
  )
}

function isActionType(value: unknown): value is StudentDashboardActionType {
  return (
    value === 'CONTINUE_EXAM' ||
    value === 'CONTINUE_PRACTICE' ||
    value === 'UPCOMING_EXAM' ||
    value === 'OPEN_PRACTICE' ||
    value === 'VIEW_RESULT'
  )
}

function isPriority(value: unknown): value is StudentDashboardActionPriority {
  return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW'
}

function normalizeStats(dto?: StudentStatsDto | null): StudentDashboardStats {
  if (!dto) return { ...EMPTY_STATS }
  return {
    inProgressCount: asNumber(dto.inProgressCount),
    upcomingExamCount: asNumber(dto.upcomingExamCount),
    openPracticeCount: asNumber(dto.openPracticeCount),
    recentSubmittedCount: asNumber(dto.recentSubmittedCount),
  }
}

function normalizeEvent(dto: StudentCalendarEventDto): DashboardCalendarEvent | null {
  if (dto.id === undefined || !dto.title || !dto.date) return null
  if (!isStudentKind(dto.kind) || !isPhase(dto.phase)) return null
  if (dto.status === 'DRAFT') return null

  return {
    id: dto.id,
    title: dto.title,
    kind: dto.kind,
    phase: dto.phase,
    date: dto.date.slice(0, 10),
    startAt: dto.startAt ?? null,
    endAt: dto.endAt ?? null,
    subjectId: dto.subjectId ?? null,
    subjectName: dto.subjectName ?? '—',
    classroomId: dto.classroomId ?? null,
    classroomCount: asNumber(dto.classroomCount, dto.classroomId ? 1 : 0),
    status: isExamStatus(dto.status) ? dto.status : 'UPCOMING',
    myStatus: isMyStatus(dto.myStatus) ? dto.myStatus : null,
  }
}

function normalizeAction(dto: StudentActionDto): StudentDashboardAction | null {
  if (dto.id === undefined || !dto.title || dto.entityId === undefined) return null
  if (!isActionType(dto.type) || !isPriority(dto.priority)) return null

  return {
    id: String(dto.id),
    type: dto.type,
    priority: dto.priority,
    title: dto.title,
    detail: dto.detail ?? '',
    entityId: dto.entityId,
    classroomId: dto.classroomId ?? null,
    actionPath: dto.actionPath ?? null,
    actionLabel: dto.actionLabel ?? null,
  }
}

function normalizeRecentResult(dto: StudentRecentResultDto): DashboardActivityItem | null {
  if (dto.id === undefined || !dto.message || !dto.occurredAt) return null
  return {
    id: String(dto.id),
    occurredAt: dto.occurredAt,
    type: dto.type ?? 'SUBMITTED',
    message: dto.message,
    entityType: dto.entityType ?? 'SUBMISSION',
    entityId: dto.entityId ?? null,
  }
}

export async function getStudentDashboard(
  params: GetStudentDashboardParams,
): Promise<StudentDashboardData> {
  const response = await apiClient.get<unknown>('/v1/student/dashboard', {
    params: {
      from: params.from,
      to: params.to,
    },
  })

  const dto = unwrapDashboard(response.data)

  return {
    generatedAt: dto.generatedAt ?? new Date().toISOString(),
    stats: normalizeStats(dto.stats),
    actions: (dto.actions ?? [])
      .map(normalizeAction)
      .filter((item): item is StudentDashboardAction => item !== null)
      .slice(0, 10),
    recentResults: (dto.recentResults ?? [])
      .map(normalizeRecentResult)
      .filter((item): item is DashboardActivityItem => item !== null)
      .slice(0, 5),
    calendarEvents: (dto.calendarEvents ?? [])
      .map(normalizeEvent)
      .filter((item): item is DashboardCalendarEvent => item !== null),
  }
}
