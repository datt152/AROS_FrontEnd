import {
  ROUTES,
  studentHistoryDetailPath,
} from '../../../routes/routes.config'
import type { TakeExamLocationState } from '../../exams/types/studentExam.types'
import type { DashboardCalendarEvent } from '../types/dashboard.types'
import type {
  StudentDashboardAction,
  StudentDashboardActionType,
} from '../types/studentDashboard.types'
import { STUDENT_ACTION_LABEL } from '../types/studentDashboard.types'

export type StudentNavTarget = {
  to: string
  state?: TakeExamLocationState
}

function normalizePathname(raw: string): string {
  let path = raw.trim()
  try {
    if (/^https?:\/\//i.test(path)) {
      const url = new URL(path)
      path = url.pathname + url.search
    }
  } catch {
    /* keep raw */
  }
  path = path.replace(/^\/api(?:\/v\d+)?/i, '')
  if (!path.startsWith('/')) path = `/${path}`
  return path
}

function parseClassroomId(search: string, fallback?: number | null): number | null {
  const fromQuery = Number(new URLSearchParams(search).get('classroomId'))
  if (Number.isFinite(fromQuery) && fromQuery > 0) return fromQuery
  if (fallback != null && fallback > 0) return fallback
  return null
}

/**
 * Map actionPath BE → route FE thật.
 * BE thường trả:
 * - /student/exams/{id}?classroomId=
 * - /student/exams/{id}/take?classroomId=
 * - /student/practice/{id}?classroomId=
 * - /student/practice/{id}/take?classroomId=
 * - /student/history/{submissionId}
 */
export function mapStudentBackendActionPath(
  actionPath: string,
  fallbackClassroomId?: number | null,
): StudentNavTarget | null {
  const full = normalizePathname(actionPath)
  const [pathnamePart, search = ''] = full.split('?')
  const pathname = pathnamePart.replace(/\/+$/, '') || '/'
  const classroomId = parseClassroomId(search, fallbackClassroomId)

  const historyMatch = pathname.match(/^\/student\/history\/(\d+)$/i)
  if (historyMatch) {
    return { to: studentHistoryDetailPath(Number(historyMatch[1])) }
  }

  const examTakeMatch = pathname.match(/^\/student\/exams\/(\d+)\/take$/i)
  if (examTakeMatch) {
    const examId = Number(examTakeMatch[1])
    if (classroomId) {
      return { to: ROUTES.student.takeExam, state: { examId, classroomId } }
    }
    return { to: ROUTES.student.exams }
  }

  const examDetailMatch = pathname.match(/^\/student\/exams\/(\d+)$/i)
  if (examDetailMatch) {
    // Sắp diễn ra / xem thông tin → list bài thi (FE chưa có trang chi tiết theo id)
    return { to: ROUTES.student.exams }
  }

  const practiceTakeMatch = pathname.match(/^\/student\/practice\/(\d+)\/take$/i)
  if (practiceTakeMatch) {
    const examId = Number(practiceTakeMatch[1])
    if (classroomId) {
      return { to: ROUTES.student.takePractice, state: { examId, classroomId } }
    }
    return { to: ROUTES.student.practice }
  }

  const practiceDetailMatch = pathname.match(/^\/student\/practice\/(\d+)$/i)
  if (practiceDetailMatch) {
    const examId = Number(practiceDetailMatch[1])
    if (classroomId) {
      return { to: ROUTES.student.takePractice, state: { examId, classroomId } }
    }
    return { to: ROUTES.student.practice }
  }

  if (pathname === ROUTES.student.takeExam || pathname === ROUTES.student.takePractice) {
    return { to: pathname }
  }

  if (
    pathname === ROUTES.student.exams ||
    pathname === ROUTES.student.practice ||
    pathname === ROUTES.student.history ||
    pathname === ROUTES.student.dashboard
  ) {
    return { to: pathname }
  }

  return null
}

export function resolveStudentActionNavigation(
  action: StudentDashboardAction,
): StudentNavTarget {
  // Sắp diễn ra: luôn về list, không vào take dù BE trả .../take
  if (action.type === 'UPCOMING_EXAM') {
    return { to: ROUTES.student.exams }
  }

  if (action.type === 'VIEW_RESULT') {
    return { to: ROUTES.student.history }
  }

  if (action.actionPath) {
    const mapped = mapStudentBackendActionPath(action.actionPath, action.classroomId)
    if (mapped) return mapped
  }

  const classroomId =
    action.classroomId != null && action.classroomId > 0 ? action.classroomId : null
  const canTakeDirect = classroomId != null

  switch (action.type) {
    case 'CONTINUE_EXAM':
      return canTakeDirect
        ? {
            to: ROUTES.student.takeExam,
            state: { examId: action.entityId, classroomId },
          }
        : { to: ROUTES.student.exams }
    case 'CONTINUE_PRACTICE':
    case 'OPEN_PRACTICE':
      return canTakeDirect
        ? {
            to: ROUTES.student.takePractice,
            state: { examId: action.entityId, classroomId },
          }
        : { to: ROUTES.student.practice }
    default:
      return { to: ROUTES.student.dashboard }
  }
}

export function studentActionLabel(action: StudentDashboardAction): string {
  return (
    action.actionLabel ??
    STUDENT_ACTION_LABEL[action.type as StudentDashboardActionType] ??
    'Xem chi tiết'
  )
}

/**
 * Lịch: đang làm / đang mở (có lớp) → take;
 * sắp diễn ra / đã đóng → list.
 */
export function resolveStudentCalendarEventNavigation(
  event: DashboardCalendarEvent,
): StudentNavTarget {
  const classroomId =
    event.classroomId != null && event.classroomId > 0 ? event.classroomId : null
  const isPractice = event.kind === 'PRACTICE'
  const listTo = isPractice ? ROUTES.student.practice : ROUTES.student.exams
  const takeTo = isPractice ? ROUTES.student.takePractice : ROUTES.student.takeExam

  if (!classroomId) return { to: listTo }

  if (event.phase === 'UPCOMING' || event.phase === 'CLOSED') {
    return { to: listTo }
  }

  if (event.myStatus === 'SUBMITTED' || event.myStatus === 'EXPIRED') {
    return { to: listTo }
  }

  if (
    event.myStatus === 'IN_PROGRESS' ||
    event.phase === 'ONGOING' ||
    event.phase === 'ENDING_SOON'
  ) {
    return {
      to: takeTo,
      state: { examId: event.id, classroomId },
    }
  }

  return { to: listTo }
}

export function resolveStudentCalendarEventPath(event: DashboardCalendarEvent): string {
  return resolveStudentCalendarEventNavigation(event).to
}

export function resolveStudentCalendarEventState(
  event: DashboardCalendarEvent,
): TakeExamLocationState | undefined {
  return resolveStudentCalendarEventNavigation(event).state
}
