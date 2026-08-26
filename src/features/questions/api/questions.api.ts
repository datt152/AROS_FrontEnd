import { apiClient } from '../../../lib/axios'
import type {
  AnswerOptionItem,
  Difficulty,
  QuestionItem,
  QuestionPayload,
  QuestionType,
} from '../types/question.types'

type QuestionDto = {
  questionId?: number
  id?: number
  subjectId?: number
  topicId?: number | null
  topicName?: string | null
  content?: string
  difficulty?: Difficulty | null
  explanation?: string | null
  options?: AnswerOptionItem[]
  type?: QuestionType
}

export type QuestionsPageResult = {
  items: QuestionItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

function normalizeQuestion(dto: QuestionDto): QuestionItem | null {
  const questionId = dto.questionId ?? dto.id
  if (questionId === undefined || dto.subjectId === undefined || !dto.content || !dto.type) return null

  return {
    questionId,
    subjectId: dto.subjectId,
    topicId: dto.topicId ?? null,
    topicName: dto.topicName ?? null,
    content: dto.content,
    difficulty: dto.difficulty ?? null,
    explanation: dto.explanation ?? null,
    options: dto.options ?? [],
    type: dto.type,
  }
}

function unwrapPage(data: unknown): {
  items: QuestionDto[]
  totalElements: number
  totalPages: number
  page: number
  size: number
} {
  if (Array.isArray(data)) {
    return {
      items: data as QuestionDto[],
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
      ? (record.content as QuestionDto[])
      : Array.isArray(record.data)
        ? (record.data as QuestionDto[])
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

export type GetQuestionsParams = {
  subjectId?: number
  topicId?: number
  page?: number
  size?: number
}

export async function getQuestions(params: GetQuestionsParams): Promise<QuestionsPageResult> {
  const response = await apiClient.get<unknown>('/v1/questions', {
    params: {
      ...(params.topicId !== undefined ? { topicId: params.topicId } : {}),
      ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  })

  const pageData = unwrapPage(response.data)
  const items = pageData.items
    .map(normalizeQuestion)
    .filter((item): item is QuestionItem => item !== null)

  return {
    items,
    totalElements: pageData.totalElements,
    totalPages: pageData.totalPages,
    page: pageData.page,
    size: pageData.size,
  }
}

export async function createQuestion(payload: QuestionPayload) {
  const response = await apiClient.post<QuestionDto>('/v1/questions', payload)
  const question = normalizeQuestion(response.data)
  if (question) return question

  return {
    questionId: Date.now(),
    subjectId: payload.subjectId,
    topicId: payload.topicId ?? null,
    topicName: null,
    content: payload.content,
    difficulty: payload.difficulty,
    explanation: payload.explanation || null,
    options: payload.options,
    type: payload.type,
  }
}

export async function updateQuestion(id: number, payload: QuestionPayload) {
  const response = await apiClient.put<QuestionDto>(`/v1/questions/${id}`, payload)
  const question = normalizeQuestion(response.data)
  if (question) return question

  return {
    questionId: id,
    subjectId: payload.subjectId,
    topicId: payload.topicId ?? null,
    topicName: null,
    content: payload.content,
    difficulty: payload.difficulty,
    explanation: payload.explanation || null,
    options: payload.options,
    type: payload.type,
  }
}

export async function deleteQuestion(id: number) {
  await apiClient.delete(`/v1/questions/${id}`)
}
