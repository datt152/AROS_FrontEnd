import { getStorage } from '../../../platform/storage'

const DRAFT_PREFIX = 'aros.exam-take-draft.v1'
const ACTIVE_PREFIX = 'aros.exam-take-active.v1'

export type TakeDraftScope = 'exam' | 'practice'

export type ExamTakeDraft = {
  examId: number
  classroomId: number
  versionCode: string
  answers: Record<number, string | string[]>
  flagged: number[]
  currentIndex: number
  phase: 'answering' | 'preview'
  updatedAt: number
}

function normalizeUserKey(email: string) {
  return email.trim().toLowerCase()
}

function draftKey(scope: TakeDraftScope, userKey: string, examId: number, classroomId: number) {
  return `${DRAFT_PREFIX}:${scope}:${userKey}:${examId}:${classroomId}`
}

function activeKey(scope: TakeDraftScope, userKey: string) {
  return `${ACTIVE_PREFIX}:${scope}:${userKey}`
}

export function loadExamTakeDraft(
  email: string | undefined,
  examId: number,
  classroomId: number,
  scope: TakeDraftScope = 'exam',
): ExamTakeDraft | null {
  const storage = getStorage()
  if (!email || !storage) return null
  try {
    const raw = storage.getItem(draftKey(scope, normalizeUserKey(email), examId, classroomId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ExamTakeDraft
    if (
      parsed.examId !== examId ||
      parsed.classroomId !== classroomId ||
      !parsed.answers ||
      typeof parsed.answers !== 'object'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveExamTakeDraft(
  email: string | undefined,
  draft: ExamTakeDraft,
  scope: TakeDraftScope = 'exam',
) {
  const storage = getStorage()
  if (!email || !storage) return
  const userKey = normalizeUserKey(email)
  try {
    storage.setItem(draftKey(scope, userKey, draft.examId, draft.classroomId), JSON.stringify(draft))
    storage.setItem(
      activeKey(scope, userKey),
      JSON.stringify({ examId: draft.examId, classroomId: draft.classroomId }),
    )
  } catch {
    // quota / private mode
  }
}

export function clearExamTakeDraft(
  email: string | undefined,
  examId: number,
  classroomId: number,
  scope: TakeDraftScope = 'exam',
) {
  const storage = getStorage()
  if (!email || !storage) return
  const userKey = normalizeUserKey(email)
  try {
    storage.removeItem(draftKey(scope, userKey, examId, classroomId))
    const activeRaw = storage.getItem(activeKey(scope, userKey))
    if (activeRaw) {
      const active = JSON.parse(activeRaw) as { examId?: number; classroomId?: number }
      if (active.examId === examId && active.classroomId === classroomId) {
        storage.removeItem(activeKey(scope, userKey))
      }
    }
  } catch {
    // ignore
  }
}

export function loadActiveExamTake(
  email: string | undefined,
  scope: TakeDraftScope = 'exam',
): { examId: number; classroomId: number } | null {
  const storage = getStorage()
  if (!email || !storage) return null
  try {
    const raw = storage.getItem(activeKey(scope, normalizeUserKey(email)))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { examId?: number; classroomId?: number }
    if (
      typeof parsed.examId !== 'number' ||
      parsed.examId <= 0 ||
      typeof parsed.classroomId !== 'number' ||
      parsed.classroomId <= 0
    ) {
      return null
    }
    return { examId: parsed.examId, classroomId: parsed.classroomId }
  } catch {
    return null
  }
}
