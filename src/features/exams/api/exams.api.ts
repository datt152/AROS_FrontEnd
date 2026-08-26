import { apiClient } from '../../../lib/axios'
import type {
  ExamConfig,
  ExamCreatePayload,
  ExamItem,
  ExamMode,
  ExamStatus,
  ExamTakeItem,
  ExamUpdatePayload,
  ExamVersionCreatePayload,
  ExamVersionDetailItem,
  QuestionPickItem,
  QuestionType,
  SubmissionPayload,
  SubmissionResultItem,
} from '../types/exam.types'

type ExamConfigDto = {
  id?: number
  semester?: string
  academicYear?: string
  totalQuestions?: number
  examType?: 'ONLINE' | 'OMR'
  shuffleQuestions?: boolean
  shuffleAnswers?: boolean
  paperCount?: number
  allowEdit?: boolean
  showScoreToStudent?: boolean
  timeLimitEnabled?: boolean
  maxAttempts?: number | null
}

type ExamQuestionRefDto = {
  questionId?: number
  id?: number
  content?: string
  type?: QuestionType
  subjectId?: number
  difficulty?: string
}

type ExamDto = {
  id?: number
  title?: string
  duration?: number
  examMode?: ExamMode
  purpose?: 'EXAM' | 'PRACTICE'
  status?: ExamStatus
  subjectId?: number
  subjectName?: string
  teacherEmail?: string
  createdAt?: string
  startAt?: string | null
  endAt?: string | null
  totalQuestions?: number
  maxScore?: number
  classroomIds?: number[]
  config?: ExamConfigDto | null
  questionIds?: Array<number | string>
  questions?: Array<number | string | ExamQuestionRefDto>
}

type ClassroomDto = {
  id?: number
  className?: string
  subjectId?: number
  subjectName?: string
}

type ExamVersionDetailDto = {
  examId?: number
  title?: string
  duration?: number
  versionCode?: string
  questions?: {
    originalQuestionId?: number
    questionId?: number
    content?: string
    type?: QuestionType
    options?: { label?: string; content?: string }[]
  }[]
}

type ExamTakeDto = {
  examId?: number
  title?: string
  duration?: number
  versionCode?: string
  startTime?: string
  purpose?: 'EXAM' | 'PRACTICE'
  timeLimitEnabled?: boolean
  showScoreToStudent?: boolean
  attemptNo?: number
  maxAttempts?: number | null
  questions?: {
    questionId?: number
    content?: string
    type?: QuestionType
    options?: { label?: string; content?: string }[]
  }[]
}

type SubmissionResultDto = {
  submissionId?: number
  id?: number
  attemptNo?: number
  scoreVisible?: boolean
  totalScore?: number | null
  maxScore?: number | null
  correctQuestions?: number | null
  totalQuestions?: number | null
}

export type ExamsPageResult = {
  items: ExamItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

function normalizeConfig(dto?: ExamConfigDto | null): ExamConfig | undefined {
  if (!dto) return undefined
  return {
    id: dto.id,
    semester: dto.semester,
    academicYear: dto.academicYear,
    totalQuestions: dto.totalQuestions,
    examType: dto.examType,
    shuffleQuestions: dto.shuffleQuestions,
    shuffleAnswers: dto.shuffleAnswers,
    paperCount: dto.paperCount,
    allowEdit: dto.allowEdit,
    showScoreToStudent: dto.showScoreToStudent,
    timeLimitEnabled: dto.timeLimitEnabled,
    maxAttempts: dto.maxAttempts ?? null,
  }
}

function toQuestionId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value)
  if (value && typeof value === 'object') {
    const record = value as ExamQuestionRefDto
    const id = record.questionId ?? record.id
    if (typeof id === 'number' && Number.isFinite(id)) return id
  }
  return null
}

function extractQuestionIds(dto: ExamDto): number[] | undefined {
  const fromIds = (dto.questionIds ?? [])
    .map(toQuestionId)
    .filter((id): id is number => id !== null)
  if (fromIds.length > 0) return fromIds

  const fromQuestions = (dto.questions ?? [])
    .map(toQuestionId)
    .filter((id): id is number => id !== null)
  if (fromQuestions.length > 0) return fromQuestions

  return undefined
}

function extractEmbeddedQuestions(dto: ExamDto, subjectId: number): QuestionPickItem[] | undefined {
  if (!Array.isArray(dto.questions) || dto.questions.length === 0) return undefined
  if (typeof dto.questions[0] !== 'object' || dto.questions[0] === null) return undefined

  const items = (dto.questions as ExamQuestionRefDto[])
    .map((question): QuestionPickItem | null => {
      const questionId = question.questionId ?? question.id
      if (questionId === undefined || !question.content || !question.type) return null
      return {
        questionId,
        content: question.content,
        type: question.type,
        subjectId: question.subjectId ?? subjectId,
        difficulty: question.difficulty,
      }
    })
    .filter((item): item is QuestionPickItem => item !== null)

  return items.length > 0 ? items : undefined
}

export function normalizeExam(dto: ExamDto): ExamItem | null {
  if (
    dto.id === undefined ||
    !dto.title ||
    dto.duration === undefined ||
    !dto.examMode ||
    dto.subjectId === undefined ||
    dto.maxScore === undefined
  ) {
    return null
  }

  const questionIds = extractQuestionIds(dto)
  const questions = extractEmbeddedQuestions(dto, dto.subjectId)

  return {
    id: dto.id,
    title: dto.title,
    duration: dto.duration,
    examMode: dto.examMode,
    purpose: dto.purpose === 'PRACTICE' ? 'PRACTICE' : 'EXAM',
    status: dto.status ?? 'DRAFT',
    subjectId: dto.subjectId,
    subjectName: dto.subjectName,
    teacherEmail: dto.teacherEmail,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    startAt: dto.startAt ?? null,
    endAt: dto.endAt ?? null,
    totalQuestions: dto.totalQuestions ?? questionIds?.length ?? questions?.length ?? 0,
    maxScore: dto.maxScore,
    classroomIds: dto.classroomIds ?? [],
    config: normalizeConfig(dto.config),
    questionIds,
    questions,
  }
}

function unwrapPage(data: unknown): {
  items: ExamDto[]
  totalElements: number
  totalPages: number
  page: number
  size: number
} {
  if (Array.isArray(data)) {
    return {
      items: data as ExamDto[],
      totalElements: data.length,
      totalPages: 1,
      page: 0,
      size: data.length,
    }
  }

  if (data && typeof data === 'object') {
    const record = data as {
      content?: unknown
      data?: unknown
      totalElements?: number
      totalPages?: number
      number?: number
      size?: number
    }

    const items = Array.isArray(record.content)
      ? (record.content as ExamDto[])
      : Array.isArray(record.data)
        ? (record.data as ExamDto[])
        : []

    const size = record.size ?? items.length
    const totalElements = record.totalElements ?? items.length
    const totalPages = record.totalPages ?? Math.max(1, Math.ceil(totalElements / Math.max(size, 1)))

    return {
      items,
      totalElements,
      totalPages,
      page: record.number ?? 0,
      size,
    }
  }

  return { items: [], totalElements: 0, totalPages: 0, page: 0, size: 0 }
}

function unwrapStringList(data: unknown): string[] {
  if (Array.isArray(data)) return data.map(String)
  if (data && typeof data === 'object') {
    const record = data as { content?: unknown; data?: unknown; versions?: unknown }
    if (Array.isArray(record.content)) return record.content.map(String)
    if (Array.isArray(record.data)) return record.data.map(String)
    if (Array.isArray(record.versions)) return record.versions.map(String)
  }
  return []
}

function unwrapClassroomList(data: unknown): ClassroomDto[] {
  if (Array.isArray(data)) return data as ClassroomDto[]
  if (data && typeof data === 'object') {
    const record = data as { content?: unknown; data?: unknown }
    if (Array.isArray(record.content)) return record.content as ClassroomDto[]
    if (Array.isArray(record.data)) return record.data as ClassroomDto[]
  }
  return []
}

export type GetExamsParams = {
  page?: number
  size?: number
  classroomId?: number
  purpose?: 'EXAM' | 'PRACTICE'
}

export async function getExams(params: GetExamsParams = {}): Promise<ExamsPageResult> {
  const response = await apiClient.get<unknown>('/v1/exams', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
      ...(params.classroomId !== undefined ? { classroomId: params.classroomId } : {}),
      ...(params.purpose !== undefined ? { purpose: params.purpose } : {}),
    },
  })

  const pageData = unwrapPage(response.data)
  const items = pageData.items.map(normalizeExam).filter((item): item is ExamItem => item !== null)

  return {
    items,
    totalElements: pageData.totalElements,
    totalPages: pageData.totalPages,
    page: pageData.page,
    size: pageData.size,
  }
}

export async function getExam(id: number) {
  const response = await apiClient.get<ExamDto>(`/v1/exams/${id}`)
  const exam = normalizeExam(response.data)
  if (!exam) throw new Error('Không tìm thấy đề thi')
  return exam
}

export async function createExam(payload: ExamCreatePayload) {
  const response = await apiClient.post<ExamDto>('/v1/exams', payload)
  const exam = normalizeExam(response.data)
  if (exam) return exam
  throw new Error('Tạo đề thi thất bại')
}

export async function updateExam(id: number, payload: ExamUpdatePayload) {
  const response = await apiClient.put<ExamDto>(`/v1/exams/${id}`, payload)
  const exam = normalizeExam(response.data)
  if (exam) return exam
  throw new Error('Cập nhật đề thi thất bại')
}

export async function deleteExam(id: number) {
  await apiClient.delete(`/v1/exams/${id}`)
}

export async function updateExamClassrooms(id: number, classroomIds: number[]) {
  await apiClient.put(`/v1/exams/${id}/classrooms`, { classroomIds })
}

export async function getExamClassrooms(id: number) {
  const response = await apiClient.get<unknown>(`/v1/exams/${id}/classrooms`)
  return unwrapClassroomList(response.data)
    .filter((item): item is ClassroomDto & { id: number; className: string } =>
      item.id !== undefined && Boolean(item.className),
    )
    .map((item) => ({
      id: item.id,
      className: item.className,
      subjectId: item.subjectId ?? 0,
      subjectName: item.subjectName,
    }))
}

export async function getExamVersions(id: number) {
  const response = await apiClient.get<unknown>(`/v1/exams/${id}/versions`)
  return unwrapStringList(response.data)
}

export async function createExamVersions(payload: ExamVersionCreatePayload) {
  const response = await apiClient.post<unknown>('/v1/exams/versions', payload)
  return unwrapStringList(response.data)
}

export async function getExamVersionDetail(examId: number, versionCode: string): Promise<ExamVersionDetailItem> {
  const response = await apiClient.get<ExamVersionDetailDto>(`/v1/exams/${examId}/versions/${versionCode}`)
  const data = response.data

  return {
    examId: data.examId ?? examId,
    title: data.title ?? '',
    duration: data.duration ?? 0,
    versionCode: data.versionCode ?? versionCode,
    questions: (data.questions ?? []).map((question) => ({
      originalQuestionId: question.originalQuestionId ?? question.questionId ?? 0,
      content: question.content ?? '',
      type: question.type ?? 'SINGLE_CHOICE',
      options: (question.options ?? []).map((option) => ({
        label: option.label ?? '',
        content: option.content ?? '',
      })),
    })),
  }
}

export async function takeExam(id: number): Promise<ExamTakeItem> {
  const response = await apiClient.get<ExamTakeDto>(`/v1/exams/${id}/take`)
  const data = response.data
  if (data.examId === undefined || !data.versionCode || !data.startTime) {
    throw new Error('Không thể tải bài thi')
  }

  return {
    examId: data.examId,
    title: data.title ?? '',
    duration: data.duration ?? 0,
    versionCode: data.versionCode,
    startTime: data.startTime,
    purpose: data.purpose === 'PRACTICE' ? 'PRACTICE' : data.purpose === 'EXAM' ? 'EXAM' : undefined,
    timeLimitEnabled: data.timeLimitEnabled,
    showScoreToStudent: data.showScoreToStudent,
    attemptNo: data.attemptNo,
    maxAttempts: data.maxAttempts ?? null,
    questions: (data.questions ?? []).map((question) => ({
      questionId: question.questionId ?? 0,
      content: question.content ?? '',
      type: question.type ?? 'SINGLE_CHOICE',
      options: (question.options ?? []).map((option) => ({
        label: option.label ?? '',
        content: option.content ?? '',
      })),
    })),
  }
}

export async function submitExam(payload: SubmissionPayload): Promise<SubmissionResultItem> {
  const response = await apiClient.post<SubmissionResultDto>('/v1/submissions', payload)
  const data = response.data
  const submissionId = data.submissionId ?? data.id
  if (submissionId === undefined) {
    throw new Error('Nộp bài thất bại')
  }

  const scoreVisible = data.scoreVisible !== false
  if (scoreVisible && (data.totalScore === undefined || data.totalScore === null || data.maxScore === undefined || data.maxScore === null)) {
    throw new Error('Nộp bài thất bại')
  }

  return {
    submissionId,
    attemptNo: data.attemptNo,
    scoreVisible,
    totalScore: data.totalScore ?? null,
    maxScore: data.maxScore ?? null,
    correctQuestions: data.correctQuestions ?? null,
    totalQuestions: data.totalQuestions ?? null,
  }
}

export function toRawPointsPayload(rawPoints: Record<number, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(rawPoints).map(([questionId, points]) => [String(questionId), points]),
  )
}
