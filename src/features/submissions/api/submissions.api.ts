import { apiClient } from '../../../lib/axios'
import type {
  ExamPurpose,
  StudentSubmissionDetail,
  StudentSubmissionDetailItem,
  StudentSubmissionItem,
  SubmissionStatus,
} from '../types/submission.types'

type StudentSubmissionItemDto = {
  submissionId?: number
  examId?: number
  examTitle?: string
  purpose?: string
  examPurpose?: string
  versionCode?: string | null
  attemptNo?: number
  status?: string
  score?: number | null
  maxScore?: number | null
  scoreVisible?: boolean
  startTime?: string
  submitTime?: string | null
}

type StudentSubmissionDetailItemDto = {
  questionId?: number
  order?: number
  content?: string
  type?: string
  selectedAnswer?: string | null
  correctAnswer?: string | null
  isCorrect?: boolean | null
}

type StudentSubmissionDetailDto = {
  submissionId?: number
  examId?: number
  examTitle?: string
  purpose?: string
  examPurpose?: string
  versionCode?: string | null
  attemptNo?: number
  status?: string
  score?: number | null
  maxScore?: number | null
  scoreVisible?: boolean
  correctQuestions?: number | null
  totalQuestions?: number | null
  startTime?: string
  submitTime?: string | null
  details?: StudentSubmissionDetailItemDto[]
}

const SUBMISSION_STATUSES: SubmissionStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'EXPIRED', 'SUBMITTED']

function unwrapObject<T extends object>(data: unknown): T | null {
  if (!data || typeof data !== 'object') return null
  const record = data as { data?: unknown }
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as T
  }
  return data as T
}

function unwrapList(data: unknown): StudentSubmissionItemDto[] {
  if (Array.isArray(data)) return data as StudentSubmissionItemDto[]
  if (data && typeof data === 'object') {
    const record = data as { content?: unknown; data?: unknown; items?: unknown }
    if (Array.isArray(record.content)) return record.content as StudentSubmissionItemDto[]
    if (Array.isArray(record.data)) return record.data as StudentSubmissionItemDto[]
    if (Array.isArray(record.items)) return record.items as StudentSubmissionItemDto[]
  }
  return []
}

function normalizeStatus(value: string | undefined): SubmissionStatus {
  const upper = (value ?? '').toUpperCase() as SubmissionStatus
  return SUBMISSION_STATUSES.includes(upper) ? upper : 'NOT_STARTED'
}

function normalizePurpose(dto: { purpose?: string; examPurpose?: string }): ExamPurpose {
  const value = dto.purpose ?? dto.examPurpose
  return value?.toUpperCase() === 'PRACTICE' ? 'PRACTICE' : 'EXAM'
}

function normalizeListItem(dto: StudentSubmissionItemDto): StudentSubmissionItem | null {
  if (dto.submissionId === undefined || dto.examId === undefined) return null
  return {
    submissionId: dto.submissionId,
    examId: dto.examId,
    examTitle: dto.examTitle ?? '',
    purpose: normalizePurpose(dto),
    versionCode: dto.versionCode ?? null,
    attemptNo: dto.attemptNo ?? 1,
    status: normalizeStatus(dto.status),
    score: dto.score ?? null,
    maxScore: dto.maxScore ?? null,
    scoreVisible: dto.scoreVisible !== false,
    startTime: dto.startTime ?? '',
    submitTime: dto.submitTime ?? null,
  }
}

function normalizeDetailItem(
  dto: StudentSubmissionDetailItemDto,
  scoreVisible: boolean,
): StudentSubmissionDetailItem | null {
  if (dto.questionId === undefined || !dto.content) return null
  return {
    questionId: dto.questionId,
    order: dto.order ?? 0,
    content: dto.content,
    type: dto.type === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE',
    selectedAnswer: dto.selectedAnswer ?? null,
    correctAnswer: scoreVisible ? dto.correctAnswer ?? null : null,
    isCorrect: scoreVisible && dto.isCorrect !== undefined && dto.isCorrect !== null ? Boolean(dto.isCorrect) : null,
  }
}

function normalizeDetail(dto: StudentSubmissionDetailDto): StudentSubmissionDetail | null {
  if (dto.submissionId === undefined || dto.examId === undefined) return null
  const scoreVisible = dto.scoreVisible !== false
  return {
    submissionId: dto.submissionId,
    examId: dto.examId,
    examTitle: dto.examTitle ?? '',
    purpose: normalizePurpose(dto),
    versionCode: dto.versionCode ?? null,
    attemptNo: dto.attemptNo ?? 1,
    status: normalizeStatus(dto.status),
    score: dto.score ?? null,
    maxScore: dto.maxScore ?? null,
    scoreVisible,
    correctQuestions: dto.correctQuestions ?? null,
    totalQuestions: dto.totalQuestions ?? null,
    startTime: dto.startTime ?? '',
    submitTime: dto.submitTime ?? null,
    details: (dto.details ?? [])
      .map((item) => normalizeDetailItem(item, scoreVisible))
      .filter((item): item is StudentSubmissionDetailItem => item !== null),
  }
}

export type GetMySubmissionsParams = {
  examId?: number
}

export async function getMySubmissions(params?: GetMySubmissionsParams): Promise<StudentSubmissionItem[]> {
  const response = await apiClient.get<unknown>('/v1/submissions/my', {
    params: params?.examId ? { examId: params.examId } : undefined,
  })
  return unwrapList(response.data)
    .map(normalizeListItem)
    .filter((item): item is StudentSubmissionItem => item !== null)
    .filter((item) => item.status !== 'NOT_STARTED')
}

export async function getMySubmissionDetail(submissionId: number): Promise<StudentSubmissionDetail> {
  const response = await apiClient.get<unknown>(`/v1/submissions/${submissionId}`)
  const detail = normalizeDetail(unwrapObject<StudentSubmissionDetailDto>(response.data) ?? {})
  if (!detail) throw new Error('Không đọc được chi tiết bài nộp')
  return detail
}
