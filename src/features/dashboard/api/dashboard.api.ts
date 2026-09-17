import { apiClient } from '../../../lib/axios'
import type { ExamStatus } from '../../exams/types/exam.types'
import type {
  DashboardActivityItem,
  DashboardCalendarEvent,
  DashboardExamKind,
  DashboardExamPhase,
  DashboardEntityType,
  DashboardStats,
  DashboardTodoItem,
  DashboardTodoPriority,
  DashboardTodoType,
  TeacherDashboardData,
} from '../types/dashboard.types'

export type GetTeacherDashboardParams = {
  from: string
  to: string
}

type DashboardStatsDto = Partial<DashboardStats>

type DashboardCalendarEventDto = {
  id?: number
  title?: string
  kind?: DashboardExamKind | string
  phase?: DashboardExamPhase | string
  date?: string
  startAt?: string | null
  endAt?: string | null
  subjectId?: number | null
  subjectName?: string | null
  classroomCount?: number | null
  status?: ExamStatus | string
}

type DashboardTodoDto = {
  id?: string | number
  type?: DashboardTodoType | string
  priority?: DashboardTodoPriority | string
  title?: string
  detail?: string
  entityType?: DashboardEntityType | string
  entityId?: number
  actionPath?: string | null
}

type DashboardActivityDto = {
  id?: string | number
  occurredAt?: string
  type?: string
  message?: string
  entityType?: string | null
  entityId?: number | null
}

type TeacherDashboardDto = {
  generatedAt?: string
  stats?: DashboardStatsDto
  todos?: DashboardTodoDto[]
  activities?: DashboardActivityDto[]
  calendarEvents?: DashboardCalendarEventDto[]
  data?: TeacherDashboardDto
}

const EMPTY_STATS: DashboardStats = {
  classroomCount: 0,
  subjectCount: 0,
  onlineExamCount: 0,
  onlineExamOngoingCount: 0,
  onlineExamUpcomingCount: 0,
  omrExamCount: 0,
  omrActiveSessionCount: 0,
  practiceCount: 0,
  practiceOpenCount: 0,
  questionCount: 0,
  questionAddedLast7Days: 0,
  templateCount: 0,
  pendingActionCount: 0,
}

function asNumber(value: unknown, fallback = 0) {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeStats(dto?: DashboardStatsDto | null): DashboardStats {
  if (!dto) return { ...EMPTY_STATS }
  return {
    classroomCount: asNumber(dto.classroomCount),
    subjectCount: asNumber(dto.subjectCount),
    onlineExamCount: asNumber(dto.onlineExamCount),
    onlineExamOngoingCount: asNumber(dto.onlineExamOngoingCount),
    onlineExamUpcomingCount: asNumber(dto.onlineExamUpcomingCount),
    omrExamCount: asNumber(dto.omrExamCount),
    omrActiveSessionCount: asNumber(dto.omrActiveSessionCount),
    practiceCount: asNumber(dto.practiceCount),
    practiceOpenCount: asNumber(dto.practiceOpenCount),
    questionCount: asNumber(dto.questionCount),
    questionAddedLast7Days: asNumber(dto.questionAddedLast7Days),
    templateCount: asNumber(dto.templateCount),
    pendingActionCount: asNumber(dto.pendingActionCount),
  }
}

function isKind(value: unknown): value is DashboardExamKind {
  return value === 'ONLINE' || value === 'OMR' || value === 'PRACTICE'
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

function isTodoType(value: unknown): value is DashboardTodoType {
  return (
    value === 'MISSING_VERSIONS' ||
    value === 'DRAFT_INCOMPLETE' ||
    value === 'OMR_SHEETS_NEED_REVIEW'
  )
}

function isPriority(value: unknown): value is DashboardTodoPriority {
  return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW'
}

function isEntityType(value: unknown): value is DashboardEntityType {
  return value === 'EXAM' || value === 'OMR_SHEET'
}

function normalizeEvent(dto: DashboardCalendarEventDto): DashboardCalendarEvent | null {
  if (dto.id === undefined || !dto.title || !dto.date) return null
  if (!isKind(dto.kind) || !isPhase(dto.phase)) return null
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
    classroomCount: asNumber(dto.classroomCount),
    status: isExamStatus(dto.status) ? dto.status : 'UPCOMING',
  }
}

function normalizeTodo(dto: DashboardTodoDto): DashboardTodoItem | null {
  if (dto.id === undefined || !dto.title || dto.entityId === undefined) return null
  if (!isTodoType(dto.type) || !isPriority(dto.priority) || !isEntityType(dto.entityType)) {
    return null
  }

  return {
    id: String(dto.id),
    type: dto.type,
    priority: dto.priority,
    title: dto.title,
    detail: dto.detail ?? '',
    entityType: dto.entityType,
    entityId: dto.entityId,
    actionPath: dto.actionPath ?? null,
  }
}

function normalizeActivity(dto: DashboardActivityDto): DashboardActivityItem | null {
  if (dto.id === undefined || !dto.message || !dto.occurredAt) return null
  return {
    id: String(dto.id),
    occurredAt: dto.occurredAt,
    type: dto.type ?? 'UNKNOWN',
    message: dto.message,
    entityType: dto.entityType ?? null,
    entityId: dto.entityId ?? null,
  }
}

function unwrapDashboard(data: unknown): TeacherDashboardDto {
  if (!data || typeof data !== 'object') return {}
  const root = data as TeacherDashboardDto
  if (root.data && typeof root.data === 'object') return root.data
  return root
}

export async function getTeacherDashboard(
  params: GetTeacherDashboardParams,
): Promise<TeacherDashboardData> {
  const response = await apiClient.get<unknown>('/v1/teacher/dashboard', {
    params: {
      from: params.from,
      to: params.to,
    },
  })

  const dto = unwrapDashboard(response.data)

  return {
    generatedAt: dto.generatedAt,
    stats: normalizeStats(dto.stats),
    todos: (dto.todos ?? [])
      .map(normalizeTodo)
      .filter((item): item is DashboardTodoItem => item !== null),
    activities: (dto.activities ?? [])
      .map(normalizeActivity)
      .filter((item): item is DashboardActivityItem => item !== null),
    calendarEvents: (dto.calendarEvents ?? [])
      .map(normalizeEvent)
      .filter((item): item is DashboardCalendarEvent => item !== null),
  }
}
