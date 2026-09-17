import { apiClient } from '../../../lib/axios'
import type {
  ExamCreatePayload,
  ExamItem,
  ExamMode,
  ExamOnlineSettings,
  ExamPaperSettings,
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
import type { StudentExamListItem, StudentExamStatus, StudentMyStatus } from '../types/studentExam.types'

type ExamOnlineSettingsDto = {
  status?: ExamStatus
  startAt?: string | null
  endAt?: string | null
  allowEdit?: boolean
  showScoreToStudent?: boolean
  maxAttempts?: number | null
  timeLimitEnabled?: boolean
}

type ExamPaperSettingsDto = {
  examDate?: string | null
  semester?: string
  academicYear?: string
  shuffleQuestions?: boolean
  shuffleAnswers?: boolean
  paperCount?: number
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
  onlineSettings?: ExamOnlineSettingsDto | null
  paperSettings?: ExamPaperSettingsDto | null
  questionIds?: Array<number | string>
  questions?: Array<number | string | ExamQuestionRefDto>
  sourceTemplateId?: number | null
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
  classroomId?: number | null
  classroomName?: string | null
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
  classroomId?: number | null
  attemptNo?: number
  scoreVisible?: boolean
  totalScore?: number | null
  maxScore?: number | null
  correctQuestions?: number | null
  totalQuestions?: number | null
}

type MyExamDto = {
  id?: number
  examId?: number
  title?: string
  duration?: number
  totalQuestions?: number
  questionCount?: number
  questionIds?: Array<number | string>
  maxScore?: number
  startAt?: string | null
  endAt?: string | null
  examStatus?: StudentExamStatus | ExamStatus
  status?: ExamStatus
  myStatus?: StudentMyStatus
  canTake?: boolean
  timeLimitEnabled?: boolean
  showScoreToStudent?: boolean
  scoreVisible?: boolean
  myScore?: number | null
  score?: number | null
  totalScore?: number | null
  classroomId?: number | null
  classroomName?: string | null
  onlineSettings?: ExamOnlineSettingsDto | null
}

export type ExamsPageResult = {
  items: ExamItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

function normalizeOnlineSettings(dto?: ExamOnlineSettingsDto | null): ExamOnlineSettings | undefined {
  if (!dto) return undefined
  return {
    status: dto.status,
    startAt: dto.startAt ?? null,
    endAt: dto.endAt ?? null,
    allowEdit: dto.allowEdit,
    showScoreToStudent: dto.showScoreToStudent,
    maxAttempts: dto.maxAttempts ?? null,
    timeLimitEnabled: dto.timeLimitEnabled,
  }
}

function normalizePaperSettings(dto?: ExamPaperSettingsDto | null): ExamPaperSettings | undefined {
  if (!dto) return undefined
  const examDate = dto.examDate ? dto.examDate.slice(0, 10) : null
  return {
    examDate,
    semester: dto.semester,
    academicYear: dto.academicYear,
    shuffleQuestions: dto.shuffleQuestions,
    shuffleAnswers: dto.shuffleAnswers,
    paperCount: dto.paperCount,
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
    onlineSettings: normalizeOnlineSettings(dto.onlineSettings),
    paperSettings: normalizePaperSettings(dto.paperSettings),
    questionIds,
    questions,
    sourceTemplateId: dto.sourceTemplateId ?? null,
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

export type GetMyExamsParams = {
  classroomId: number
  purpose?: 'EXAM' | 'PRACTICE'
  page?: number
  size?: number
}

export type MyExamsPageResult = {
  items: StudentExamListItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

const STUDENT_EXAM_STATUSES: StudentExamStatus[] = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CLOSED']
const STUDENT_MY_STATUSES: StudentMyStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'EXPIRED', 'SUBMITTED']

function toStudentExamStatus(value: unknown): StudentExamStatus {
  if (typeof value === 'string' && STUDENT_EXAM_STATUSES.includes(value as StudentExamStatus)) {
    return value as StudentExamStatus
  }
  if (value === 'DRAFT') return 'UPCOMING'
  return 'CLOSED'
}

function toStudentMyStatus(value: unknown): StudentMyStatus {
  if (typeof value === 'string' && STUDENT_MY_STATUSES.includes(value as StudentMyStatus)) {
    return value as StudentMyStatus
  }
  return 'NOT_STARTED'
}

function normalizeMyExam(
  dto: MyExamDto,
  purpose: 'EXAM' | 'PRACTICE' = 'EXAM',
): StudentExamListItem | null {
  const id = dto.id ?? dto.examId
  if (id === undefined || !dto.title) return null

  const examStatus = toStudentExamStatus(dto.examStatus ?? dto.status)
  const myStatus = toStudentMyStatus(dto.myStatus)
  const rawCanTake = dto.canTake
  const canTake =
    typeof rawCanTake === 'boolean'
      ? rawCanTake
      : examStatus === 'ONGOING' && (myStatus === 'NOT_STARTED' || myStatus === 'IN_PROGRESS')

  const showScoreToStudent =
    dto.showScoreToStudent ??
    dto.scoreVisible ??
    dto.onlineSettings?.showScoreToStudent ??
    purpose === 'PRACTICE'

  const rawScore = dto.myScore ?? dto.score ?? dto.totalScore
  const myScore =
    typeof rawScore === 'number' && Number.isFinite(rawScore) ? rawScore : null

  const questionIdsCount = Array.isArray(dto.questionIds) ? dto.questionIds.length : 0
  const totalQuestions =
    dto.totalQuestions ??
    dto.questionCount ??
    (questionIdsCount > 0 ? questionIdsCount : 0)

  // PRACTICE mặc định không giới hạn giờ (giống form GV); EXAM mặc định có giờ.
  const timeLimitEnabled =
    dto.timeLimitEnabled ??
    dto.onlineSettings?.timeLimitEnabled ??
    purpose !== 'PRACTICE'

  return {
    id,
    title: dto.title,
    duration: dto.duration ?? 0,
    totalQuestions,
    maxScore: dto.maxScore ?? 0,
    startAt: dto.startAt ?? null,
    endAt: dto.endAt ?? null,
    examStatus,
    myStatus,
    canTake,
    timeLimitEnabled: Boolean(timeLimitEnabled),
    showScoreToStudent: Boolean(showScoreToStudent),
    myScore,
    classroomId: dto.classroomId ?? null,
    classroomName: dto.classroomName ?? null,
  }
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

/** Đề giao cho SV trong lớp — GET /v1/exams/my */
export async function getMyExams(params: GetMyExamsParams): Promise<MyExamsPageResult> {
  const purpose = params.purpose ?? 'EXAM'
  const page = params.page ?? 0
  const size = params.size ?? 10

  const response = await apiClient.get<unknown>('/v1/exams/my', {
    params: {
      classroomId: params.classroomId,
      purpose,
      page,
      size,
    },
  })

  const pageData = unwrapPage(response.data)
  const items = pageData.items
    .map((item) => normalizeMyExam(item as MyExamDto, purpose))
    .filter((item): item is StudentExamListItem => item !== null)

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

export async function saveExamAsTemplate(id: number) {
  const response = await apiClient.post<{ id?: number; title?: string }>(`/v1/exams/${id}/save-as-template`)
  return {
    id: response.data?.id,
    title: response.data?.title,
  }
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

/** Tải PDF mã đề: GET /v1/exams/{id}/versions/{code}/pdf */
export async function getExamVersionPdf(examId: number, versionCode: string): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/v1/exams/${examId}/versions/${encodeURIComponent(versionCode)}/pdf`,
    {
      responseType: 'blob',
      timeout: 60_000,
      headers: {
        Accept: 'application/pdf',
      },
    },
  )

  const blob = response.data
  const rawType = response.headers['content-type']
  const contentType = `${typeof rawType === 'string' ? rawType : ''}|${blob.type}`
  if (contentType.includes('application/json') || contentType.includes('text/')) {
    const text = await blob.text()
    let message = 'Không thể tải PDF mã đề'
    try {
      const parsed = JSON.parse(text) as { message?: string; detail?: string; error?: string }
      message = parsed.message ?? parsed.detail ?? parsed.error ?? message
    } catch {
      if (text.trim()) message = text.trim()
    }
    throw new Error(message)
  }

  return blob.type ? blob : new Blob([blob], { type: 'application/pdf' })
}

export function openExamVersionPdf(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export async function takeExam(id: number, classroomId: number): Promise<ExamTakeItem> {
  const response = await apiClient.get<ExamTakeDto>(`/v1/exams/${id}/take`, {
    params: { classroomId },
  })
  const data = response.data
  if (data.examId === undefined || !data.versionCode || !data.startTime) {
    throw new Error('Không thể tải bài thi')
  }

  return {
    examId: data.examId,
    classroomId: data.classroomId ?? classroomId,
    classroomName: data.classroomName ?? null,
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
    classroomId: data.classroomId ?? payload.classroomId,
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
