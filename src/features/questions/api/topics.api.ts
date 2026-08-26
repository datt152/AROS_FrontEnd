import { apiClient } from '../../../lib/axios'
import type { TopicItem, TopicPayload } from '../types/topic.types'

type TopicDto = {
  id?: number
  name?: string
  description?: string | null
  displayOrder?: number | null
  subjectId?: number
  subjectName?: string | null
  isActive?: boolean | null
  questionCount?: number | null
}

export type TopicsPageResult = {
  items: TopicItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

function normalizeTopic(dto: TopicDto): TopicItem | null {
  if (dto.id === undefined || !dto.name || dto.subjectId === undefined) return null

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    displayOrder: dto.displayOrder ?? 0,
    subjectId: dto.subjectId,
    subjectName: dto.subjectName ?? undefined,
    isActive: dto.isActive ?? true,
    questionCount: dto.questionCount ?? 0,
  }
}

function unwrapPage(data: unknown): {
  items: TopicDto[]
  totalElements: number
  totalPages: number
  page: number
  size: number
} {
  if (Array.isArray(data)) {
    return {
      items: data as TopicDto[],
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
      ? (record.content as TopicDto[])
      : Array.isArray(record.data)
        ? (record.data as TopicDto[])
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

export type GetTopicsParams = {
  subjectId: number
  page?: number
  size?: number
}

export async function getTopics(params: GetTopicsParams): Promise<TopicsPageResult> {
  const response = await apiClient.get<unknown>('/v1/topics', {
    params: {
      subjectId: params.subjectId,
      page: params.page ?? 0,
      size: params.size ?? 50,
    },
  })

  const pageData = unwrapPage(response.data)
  const items = pageData.items
    .map(normalizeTopic)
    .filter((item): item is TopicItem => item !== null)

  return {
    items,
    totalElements: pageData.totalElements,
    totalPages: pageData.totalPages,
    page: pageData.page,
    size: pageData.size,
  }
}

export async function getTopic(id: number) {
  const response = await apiClient.get<TopicDto>(`/v1/topics/${id}`)
  const topic = normalizeTopic(response.data)
  if (!topic) throw new Error('Topic not found')
  return topic
}

export async function createTopic(payload: TopicPayload) {
  const response = await apiClient.post<TopicDto>('/v1/topics', payload)
  const topic = normalizeTopic(response.data)
  if (topic) return topic

  return {
    id: Date.now(),
    name: payload.name,
    description: payload.description,
    displayOrder: payload.displayOrder,
    subjectId: payload.subjectId,
    questionCount: 0,
    isActive: true,
  }
}

export async function updateTopic(id: number, payload: TopicPayload) {
  const response = await apiClient.put<TopicDto>(`/v1/topics/${id}`, payload)
  const topic = normalizeTopic(response.data)
  if (topic) return topic

  return {
    id,
    name: payload.name,
    description: payload.description,
    displayOrder: payload.displayOrder,
    subjectId: payload.subjectId,
    questionCount: 0,
    isActive: true,
  }
}

export async function deleteTopic(id: number) {
  await apiClient.delete(`/v1/topics/${id}`)
}
