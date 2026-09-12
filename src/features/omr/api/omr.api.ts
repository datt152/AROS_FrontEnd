import { apiClient } from '../../../lib/axios'
import type {
  CreateExamSessionPayload,
  ExamSessionItem,
  ExamSessionStatus,
  OmrAnswerItem,
  OmrSheetItem,
  OmrSheetReviewPayload,
  OmrSheetStatus,
} from '../types/omr.types'

type ExamSessionDto = {
  id?: number
  examId?: number
  examTitle?: string
  name?: string
  status?: string
  createdAt?: string
  sheetCount?: number
}

type OmrBubbleDto = {
  choice?: string
  x?: number
  y?: number
  w?: number
  h?: number
}

type OmrAnswerDto = {
  question?: number
  chosen?: string | null
  correctAnswer?: string | null
  isCorrect?: boolean | null
  status?: string
  bubble?: OmrBubbleDto | null
}

type OmrSheetDto = {
  submissionId?: number
  examSessionId?: number
  examId?: number
  status?: string
  studentId?: string | null
  matchedStudentId?: number | null
  studentName?: string | null
  examCode?: string | null
  score?: number | null
  maxScore?: number | null
  warpedUrl?: string | null
  originalImageUrl?: string | null
  needReview?: number[]
  answers?: OmrAnswerDto[]
  gradedAt?: string | null
}

const SESSION_STATUSES: ExamSessionStatus[] = ['OPEN', 'CLOSED', 'GRADED']
const SHEET_STATUSES: OmrSheetStatus[] = [
  'PROCESSING',
  'GRADED',
  'NEEDS_REVIEW',
  'RETAKE_REQUIRED',
  'FAILED',
]

function unwrapObject<T extends object>(data: unknown): T | null {
  if (!data || typeof data !== 'object') return null
  const record = data as { data?: unknown }
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as T
  }
  return data as T
}

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (!data || typeof data !== 'object') return []
  const record = data as { content?: unknown; data?: unknown; items?: unknown }
  if (Array.isArray(record.content)) return record.content as T[]
  if (Array.isArray(record.data)) return record.data as T[]
  if (Array.isArray(record.items)) return record.items as T[]
  return []
}

function normalizeSessionStatus(value: string | undefined): ExamSessionStatus {
  const upper = (value ?? '').toUpperCase() as ExamSessionStatus
  return SESSION_STATUSES.includes(upper) ? upper : 'OPEN'
}

function normalizeSheetStatus(value: string | undefined): OmrSheetStatus {
  const upper = (value ?? '').toUpperCase() as OmrSheetStatus
  return SHEET_STATUSES.includes(upper) ? upper : 'FAILED'
}

function normalizeBubble(dto: OmrBubbleDto | null | undefined): OmrAnswerItem['bubble'] {
  if (!dto) return null
  const w = dto.w ?? 0
  const h = dto.h ?? 0
  if (w <= 0 || h <= 0) return null
  return {
    choice: dto.choice ?? '',
    x: dto.x ?? 0,
    y: dto.y ?? 0,
    w,
    h,
  }
}

function normalizeAnswer(dto: OmrAnswerDto): OmrAnswerItem | null {
  if (dto.question === undefined) return null
  return {
    question: dto.question,
    chosen: dto.chosen ?? null,
    correctAnswer: dto.correctAnswer ?? null,
    isCorrect: dto.isCorrect ?? null,
    status: dto.status ?? '',
    bubble: normalizeBubble(dto.bubble),
  }
}

function normalizeSession(dto: ExamSessionDto): ExamSessionItem | null {
  if (dto.id === undefined || dto.examId === undefined || !dto.name) return null
  return {
    id: dto.id,
    examId: dto.examId,
    examTitle: dto.examTitle ?? '',
    name: dto.name,
    status: normalizeSessionStatus(dto.status),
    createdAt: dto.createdAt ?? '',
    sheetCount: dto.sheetCount ?? 0,
  }
}

function normalizeSheet(dto: OmrSheetDto): OmrSheetItem | null {
  if (
    dto.submissionId === undefined ||
    dto.examSessionId === undefined ||
    dto.examId === undefined
  ) {
    return null
  }

  return {
    submissionId: dto.submissionId,
    examSessionId: dto.examSessionId,
    examId: dto.examId,
    status: normalizeSheetStatus(dto.status),
    studentId: dto.studentId ?? null,
    matchedStudentId: dto.matchedStudentId ?? null,
    studentName: dto.studentName ?? null,
    examCode: dto.examCode ?? null,
    score: dto.score ?? null,
    maxScore: dto.maxScore ?? null,
    warpedUrl: dto.warpedUrl ?? null,
    originalImageUrl: dto.originalImageUrl ?? null,
    needReview: Array.isArray(dto.needReview) ? dto.needReview : [],
    answers: (dto.answers ?? [])
      .map(normalizeAnswer)
      .filter((item): item is OmrAnswerItem => item !== null),
    gradedAt: dto.gradedAt ?? null,
  }
}

export async function getExamSessions(examId: number): Promise<ExamSessionItem[]> {
  const response = await apiClient.get<unknown>('/v1/exam-sessions', {
    params: { examId },
  })
  return unwrapList<ExamSessionDto>(response.data)
    .map(normalizeSession)
    .filter((item): item is ExamSessionItem => item !== null)
}

export async function getExamSession(sessionId: number): Promise<ExamSessionItem> {
  const response = await apiClient.get<unknown>(`/v1/exam-sessions/${sessionId}`)
  const session = normalizeSession(unwrapObject<ExamSessionDto>(response.data) ?? {})
  if (!session) throw new Error('Không tìm thấy phiên chấm')
  return session
}

export async function createExamSession(payload: CreateExamSessionPayload): Promise<ExamSessionItem> {
  const response = await apiClient.post<unknown>('/v1/exam-sessions', payload)
  const session = normalizeSession(unwrapObject<ExamSessionDto>(response.data) ?? {})
  if (!session) throw new Error('Tạo phiên chấm thất bại')
  return session
}

export async function updateExamSessionStatus(
  sessionId: number,
  status: ExamSessionStatus,
): Promise<ExamSessionItem> {
  const response = await apiClient.patch<unknown>(`/v1/exam-sessions/${sessionId}/status`, null, {
    params: { status },
  })
  const session = normalizeSession(unwrapObject<ExamSessionDto>(response.data) ?? {})
  if (!session) throw new Error('Cập nhật trạng thái phiên thất bại')
  return session
}

export async function getOmrSheets(sessionId: number): Promise<OmrSheetItem[]> {
  const response = await apiClient.get<unknown>(`/v1/exam-sessions/${sessionId}/submissions`)
  return unwrapList<OmrSheetDto>(response.data)
    .map(normalizeSheet)
    .filter((item): item is OmrSheetItem => item !== null)
}

export async function uploadOmrSheet(sessionId: number, file: File): Promise<OmrSheetItem> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<unknown>(
    `/v1/exam-sessions/${sessionId}/submissions`,
    formData,
    {
      timeout: 60_000,
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            if (typeof headers.set === 'function') {
              headers.set('Content-Type', false)
            } else {
              delete (headers as Record<string, unknown>)['Content-Type']
            }
          }
          return data
        },
      ],
    },
  )

  const sheet = normalizeSheet(unwrapObject<OmrSheetDto>(response.data) ?? {})
  if (!sheet) throw new Error('Upload phiếu OMR thất bại')
  return sheet
}

export async function getOmrSheet(sheetId: number): Promise<OmrSheetItem> {
  const response = await apiClient.get<unknown>(`/v1/omr-sheets/${sheetId}`)
  const sheet = normalizeSheet(unwrapObject<OmrSheetDto>(response.data) ?? {})
  if (!sheet) throw new Error('Không tìm thấy phiếu OMR')
  return sheet
}

export async function reviewOmrSheet(
  sheetId: number,
  payload: OmrSheetReviewPayload,
): Promise<OmrSheetItem> {
  const response = await apiClient.patch<unknown>(`/v1/omr-sheets/${sheetId}/review`, payload)
  const sheet = normalizeSheet(unwrapObject<OmrSheetDto>(response.data) ?? {})
  if (!sheet) throw new Error('Lưu review phiếu thất bại')
  return sheet
}
