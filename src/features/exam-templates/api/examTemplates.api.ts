import { apiClient } from '../../../lib/axios'
import type { ExamTemplateItem, ExamTemplatePayload } from '../types/examTemplate.types'

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
  const response = await apiClient.post<ExamTemplateDto>('/v1/exam-templates', payload)
  const template = normalizeTemplate(response.data)
  if (template) return template
  throw new Error('Tạo template thất bại')
}

export async function updateExamTemplate(id: number, payload: ExamTemplatePayload) {
  const response = await apiClient.put<ExamTemplateDto>(`/v1/exam-templates/${id}`, payload)
  const template = normalizeTemplate(response.data)
  if (template) return template
  throw new Error('Cập nhật template thất bại')
}

export async function deleteExamTemplate(id: number) {
  await apiClient.delete(`/v1/exam-templates/${id}`)
}
