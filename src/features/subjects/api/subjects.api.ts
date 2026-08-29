import { apiClient } from '../../../lib/axios'
import type { SubjectItem, SubjectPayload, SubjectUpdatePayload } from '../types/subject.types'

type SubjectDto = {
  id?: number
  subjectName?: string
  description?: string
  isActive?: boolean
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

function unwrapList(data: unknown): SubjectDto[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: SubjectDto[] }).data
  }
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: SubjectDto[] }).content
  }
  return []
}

export type GetSubjectsParams = {
  includeInactive?: boolean
}

export async function getSubjects(params: GetSubjectsParams = {}) {
  const response = await apiClient.get<unknown>('/v1/subjects', {
    params: params.includeInactive ? { includeInactive: true } : undefined,
  })
  return unwrapList(response.data)
    .map(normalizeSubject)
    .filter((item): item is SubjectItem => item !== null)
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
