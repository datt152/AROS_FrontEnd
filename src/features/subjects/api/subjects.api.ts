import { apiClient } from '../../../lib/axios'
import type { SubjectItem, SubjectPayload, SubjectUpdatePayload } from '../types/subject.types'

type SubjectDto = {
  id?: number
  subjectName?: string
  description?: string
  isActive?: boolean
}

export type SubjectsPageResult = {
  items: SubjectItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

function normalizeSubject(dto: SubjectDto): SubjectItem | null {
  if (dto.id === undefined || !dto.subjectName) return null
  return {
    id: dto.id,
    subjectName: dto.subjectName,
    description: dto.description ?? '',
    isActive: dto.isActive ?? true,
  }
}

function unwrapPage(data: unknown): {
  items: SubjectDto[]
  totalElements: number
  totalPages: number
  page: number
  size: number
} {
  if (Array.isArray(data)) {
    return {
      items: data as SubjectDto[],
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
      ? (record.content as SubjectDto[])
      : Array.isArray(record.data)
        ? (record.data as SubjectDto[])
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

export type GetSubjectsParams = {
  includeInactive?: boolean
  page?: number
  size?: number
}

/** Dropdown / reference lists — đủ lớn để chọn môn. */
export const SUBJECTS_PICKER_SIZE = 100

export async function getSubjects(params: GetSubjectsParams = {}): Promise<SubjectsPageResult> {
  const page = params.page ?? 0
  const size = params.size ?? SUBJECTS_PICKER_SIZE

  const response = await apiClient.get<unknown>('/v1/subjects', {
    params: {
      page,
      size,
      ...(params.includeInactive ? { includeInactive: true } : {}),
    },
  })

  const pageData = unwrapPage(response.data)
  const items = pageData.items.map(normalizeSubject).filter((item): item is SubjectItem => item !== null)

  return {
    items,
    totalElements: pageData.totalElements,
    totalPages: pageData.totalPages,
    page: pageData.page,
    size: pageData.size,
  }
}

export async function getSubject(id: number) {
  const response = await apiClient.get<SubjectDto>(`/v1/subjects/${id}`)
  const subject = normalizeSubject(response.data)
  if (!subject) throw new Error('Subject not found')
  return subject
}

export async function createSubject(payload: SubjectPayload) {
  const response = await apiClient.post<SubjectDto>('/v1/subjects', payload)
  const subject = normalizeSubject(response.data)
  if (subject) return subject
  return {
    id: Date.now(),
    subjectName: payload.subjectName,
    description: payload.description,
    isActive: true,
  }
}

export async function updateSubject(id: number, payload: SubjectUpdatePayload) {
  const response = await apiClient.put<SubjectDto>(`/v1/subjects/${id}`, payload)
  const subject = normalizeSubject(response.data)
  if (subject) return subject
  return {
    id,
    subjectName: payload.subjectName,
    description: payload.description,
    isActive: payload.isActive ?? true,
  }
}

export async function deleteSubject(id: number) {
  await apiClient.delete(`/v1/subjects/${id}`)
}
