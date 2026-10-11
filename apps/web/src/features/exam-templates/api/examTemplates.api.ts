import { apiClient } from '../../../lib/axios'
import type {
  ExamTemplateItem,
  ExamTemplatePayload,
  ExamTemplatePreviewPayload,
  ExamTemplatePreviewQuestion,
  ExamTemplatePreviewResult,
} from '../types/examTemplate.types'
import type { QuestionType } from '../../exams/types/exam.types'

type ExamTemplateDto = {
  id?: number
  title?: string
  subjectId?: number
  subjectName?: string
  teacherEmail?: string
  questionIds?: Array<number | string>
  totalQuestions?: number
  createdAt?: string
  isActive?: boolean
}

type PreviewQuestionDto = {
  questionId?: number
  id?: number
  content?: string
  type?: QuestionType
  topicId?: number | null
  topicName?: string | null
}

type PreviewDto = {
  questionIds?: Array<number | string>
  questions?: PreviewQuestionDto[]
  totalQuestions?: number
  data?: PreviewDto
}

export type ExamTemplatesPageResult = {
  items: ExamTemplateItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export type GetExamTemplatesParams = {
  subjectId?: number
  page?: number
  size?: number
}

function toQuestionIds(values?: Array<number | string>): number[] {
  if (!values) return []
  return values
    .map((value) => (typeof value === 'number' ? value : Number(value)))
    .filter((id) => Number.isFinite(id))
}

function normalizePreviewQuestion(dto: PreviewQuestionDto): ExamTemplatePreviewQuestion | null {
  const questionId = dto.questionId ?? dto.id
  if (questionId === undefined || !dto.content) return null
  return {
    questionId,
    content: dto.content,
    type: dto.type,
    topicId: dto.topicId ?? null,
    topicName: dto.topicName ?? null,
  }
}

function normalizePreview(data: unknown): ExamTemplatePreviewResult {
  let root: PreviewDto | PreviewQuestionDto[] | null = null

  if (Array.isArray(data)) {
    root = data as PreviewQuestionDto[]
  } else if (data && typeof data === 'object') {
    const record = data as PreviewDto & { items?: PreviewQuestionDto[]; content?: PreviewQuestionDto[] }
    if (record.data && typeof record.data === 'object') {
      root = record.data
    } else {
      root = record
    }
  }

  if (!root) {
    throw new Error('Preview không hợp lệ')
  }

  if (Array.isArray(root)) {
    const fromQuestions = root
      .map(normalizePreviewQuestion)
      .filter((item): item is ExamTemplatePreviewQuestion => item !== null)
    const questionIds = fromQuestions.map((q) => q.questionId)
    if (questionIds.length < 1) {
      throw new Error('Không đủ câu hỏi để tạo đề theo chủ đề')
    }
    return {
      questionIds,
      questions: fromQuestions,
      totalQuestions: questionIds.length,
    }
  }

  const nestedList =
    root.questions ??
    (Array.isArray((root as { items?: PreviewQuestionDto[] }).items)
      ? (root as { items: PreviewQuestionDto[] }).items
      : undefined) ??
    (Array.isArray((root as { content?: PreviewQuestionDto[] }).content)
      ? (root as { content: PreviewQuestionDto[] }).content
      : undefined)

  const fromQuestions = (nestedList ?? [])
    .map(normalizePreviewQuestion)
    .filter((item): item is ExamTemplatePreviewQuestion => item !== null)

  const questionIds =
    toQuestionIds(root.questionIds).length > 0
      ? toQuestionIds(root.questionIds)
      : fromQuestions.map((q) => q.questionId)

  if (questionIds.length < 1) {
    throw new Error('Không đủ câu hỏi để tạo đề theo chủ đề')
  }

  return {
    questionIds,
    questions: fromQuestions,
    totalQuestions: root.totalQuestions ?? questionIds.length,
  }
}

function normalizeTemplate(dto: ExamTemplateDto): ExamTemplateItem | null {
  if (dto.id === undefined || !dto.title || dto.subjectId === undefined) return null

  const questionIds = toQuestionIds(dto.questionIds)

  return {
    id: dto.id,
    title: dto.title,
    subjectId: dto.subjectId,
    subjectName: dto.subjectName,
    teacherEmail: dto.teacherEmail,
    questionIds,
    totalQuestions: dto.totalQuestions ?? questionIds.length,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    isActive: dto.isActive ?? true,
  }
}

function unwrapPage(data: unknown): {
  items: ExamTemplateDto[]
  totalElements: number
  totalPages: number
  page: number
  size: number
} {
  if (Array.isArray(data)) {
    return {
      items: data as ExamTemplateDto[],
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
      ? (record.content as ExamTemplateDto[])
      : Array.isArray(record.data)
        ? (record.data as ExamTemplateDto[])
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

export async function getExamTemplates(
  params: GetExamTemplatesParams = {},
): Promise<ExamTemplatesPageResult> {
  const response = await apiClient.get<unknown>('/v1/exam-templates', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
    },
  })

  const pageData = unwrapPage(response.data)
  const items = pageData.items
    .map(normalizeTemplate)
    .filter((item): item is ExamTemplateItem => item !== null)

  return {
    items,
    totalElements: pageData.totalElements,
    totalPages: pageData.totalPages,
    page: pageData.page,
    size: pageData.size,
  }
}

export async function getExamTemplate(id: number) {
  const response = await apiClient.get<ExamTemplateDto>(`/v1/exam-templates/${id}`)
  const template = normalizeTemplate(response.data)
  if (!template) throw new Error('Không tìm thấy template')
  return template
}

export async function createExamTemplate(payload: ExamTemplatePayload) {
  const response = await apiClient.post<ExamTemplateDto>('/v1/exam-templates', {
    title: payload.title,
    subjectId: payload.subjectId,
    questionIds: payload.questionIds ?? [],
  })
  const template = normalizeTemplate(response.data)
  if (template) return template
  throw new Error('Tạo template thất bại')
}

export async function updateExamTemplate(id: number, payload: ExamTemplatePayload) {
  const response = await apiClient.put<ExamTemplateDto>(`/v1/exam-templates/${id}`, {
    title: payload.title,
    subjectId: payload.subjectId,
    questionIds: payload.questionIds ?? [],
  })
  const template = normalizeTemplate(response.data)
  if (template) return template
  throw new Error('Cập nhật template thất bại')
}

export async function previewExamTemplate(
  payload: ExamTemplatePreviewPayload,
): Promise<ExamTemplatePreviewResult> {
  const response = await apiClient.post<unknown>('/v1/exam-templates/preview', {
    title: payload.title,
    subjectId: payload.subjectId,
    selectionMode: payload.selectionMode,
    topicSelections: payload.topicSelections,
  })
  return normalizePreview(response.data)
}

export async function deleteExamTemplate(id: number) {
  await apiClient.delete(`/v1/exam-templates/${id}`)
}
