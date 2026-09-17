import {
  ROUTES,
  omrSessionPath,
  omrSessionsPath,
  omrSheetPath,
} from '../../../routes/routes.config'
import type {
  DashboardCalendarEvent,
  DashboardTodoItem,
  DashboardTodoType,
} from '../types/dashboard.types'

const TODO_ACTION_LABEL: Record<DashboardTodoType, string> = {
  MISSING_VERSIONS: 'Sinh mã đề',
  DRAFT_INCOMPLETE: 'Hoàn tất đề',
  OMR_SHEETS_NEED_REVIEW: 'Xem phiếu OMR',
}

export function examPanelPath(examId: number, mode: 'ONLINE' | 'OMR' = 'ONLINE') {
  const base = mode === 'OMR' ? ROUTES.teacher.examsOmr : ROUTES.teacher.exams
  return `${base}?detail=${examId}`
}

export function practicePanelPath(practiceId: number) {
  return `${ROUTES.teacher.practice}?detail=${practiceId}`
}

function lastNumericSegment(pathname: string): number | null {
  const match = pathname.match(/\/(\d+)(?:\/)?(?:\?.*)?$/)
  if (!match) return null
  const id = Number(match[1])
  return Number.isFinite(id) && id > 0 ? id : null
}

function normalizePathname(raw: string): string {
  let path = raw.trim()
  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname + new URL(path).search
    }
  } catch {
  }
  path = path.replace(/^\/api(?:\/v\d+)?/i, '')
  if (!path.startsWith('/')) path = `/${path}`
  return path
}

/**
 * Map actionPath BE → route FE.
 * - Exam / Practice: list + ?detail=id (mở panel)
 * - OMR sheet / session: trang chi tiết thật
 */
export function mapBackendActionPath(actionPath: string): string | null {
  const full = normalizePathname(actionPath)
  const [pathnamePart, search = ''] = full.split('?')
  const pathname = pathnamePart.replace(/\/+$/, '') || '/'
  const searchParams = new URLSearchParams(search)
  const id = lastNumericSegment(pathname)

  if (
    pathname === ROUTES.teacher.exams ||
    pathname === ROUTES.teacher.examsOmr ||
    pathname === ROUTES.teacher.practice
  ) {
    const detail = searchParams.get('detail')
    if (detail) return `${pathname}?detail=${detail}`
  }

  // Phiếu OMR — trang review
  const sheetMatch = pathname.match(/\/omr\/sheets\/(\d+)$/i) ?? pathname.match(/\/omr-sheets\/(\d+)$/i)
  if (sheetMatch) return omrSheetPath(Number(sheetMatch[1]))

  // Workspace phiên chấm
  const sessionMatch = pathname.match(/\/omr\/sessions\/(\d+)$/i)
  if (sessionMatch) return omrSessionPath(Number(sessionMatch[1]))

  // Danh sách phiên theo đề OMR
  const sessionsByExam = pathname.match(/\/omr\/exams\/(\d+)\/sessions$/i)
  if (sessionsByExam) {
    const classroomId = Number(searchParams.get('classroomId'))
    return omrSessionsPath(
      Number(sessionsByExam[1]),
      Number.isFinite(classroomId) && classroomId > 0 ? classroomId : undefined,
    )
  }

  // Practice detail / path → panel
  if (/\/practice(?:\/|$)/i.test(pathname) && id) {
    return practicePanelPath(id)
  }

  // OMR exam path → panel đề OMR
  if (/\/exams\/omr(?:\/|$)/i.test(pathname) && id) {
    return examPanelPath(id, 'OMR')
  }

  // Online exam path → panel kỳ thi online
  if (/\/exams(?:\/|$)/i.test(pathname) && id) {
    return examPanelPath(id, 'ONLINE')
  }

  // Path FE đã đúng (list / omr-upload / grading…) — giữ nguyên nếu nằm trong app teacher
  if (pathname.startsWith('/teacher/')) {
    return search ? `${pathname}?${search}` : pathname
  }

  return null
}

/** Ưu tiên actionPath BE (đã map); fallback entityType + type + entityId. */
export function resolveTodoPath(todo: DashboardTodoItem): string {
  if (todo.actionPath) {
    const mapped = mapBackendActionPath(todo.actionPath)
    if (mapped) return mapped
  }

  // Chấm OMR / review phiếu → trang chi tiết sheet
  if (todo.entityType === 'OMR_SHEET' || todo.type === 'OMR_SHEETS_NEED_REVIEW') {
    return omrSheetPath(todo.entityId)
  }

  // Exam — mở panel trên list tương ứng
  if (todo.type === 'MISSING_VERSIONS') {
    return examPanelPath(todo.entityId, 'OMR')
  }

  return examPanelPath(todo.entityId, 'ONLINE')
}

export function todoActionLabel(todo: DashboardTodoItem): string {
  return TODO_ACTION_LABEL[todo.type] ?? 'Xem chi tiết'
}

/** Lịch: deep-link mở panel (exam/practice) hoặc phiên OMR khi đang/đã chấm. */
export function resolveCalendarEventPath(event: DashboardCalendarEvent): string {
  if (event.kind === 'PRACTICE') {
    return practicePanelPath(event.id)
  }

  if (event.kind === 'OMR') {
    // Đang / đã thi OMR → vào danh sách phiên chấm; còn lại mở panel đề
    if (event.status === 'ONGOING' || event.status === 'COMPLETED') {
      return omrSessionsPath(event.id)
    }
    return examPanelPath(event.id, 'OMR')
  }

  return examPanelPath(event.id, 'ONLINE')
}
