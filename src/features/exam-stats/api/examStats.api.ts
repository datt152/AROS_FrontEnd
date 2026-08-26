import { apiClient } from '../../../lib/axios'
import type {
  ExamStats,
  QuestionStatItem,
  ScoreDistributionBucket,
} from '../types/examStats.types'

type ScoreDistributionBucketDto = {
  label?: string
  minInclusive?: number
  maxExclusive?: number
  count?: number
}

type QuestionStatItemDto = {
  questionId?: number
  order?: number
  content?: string
  rawPoint?: number
  answeredCount?: number
  correctCount?: number
  correctRate?: number | null
}

type ExamStatsDto = {
  examId?: number
  examTitle?: string
  maxScore?: number
  classroomId?: number | null
  classroomName?: string | null
  totalStudents?: number
  submittedCount?: number
  inProgressCount?: number
  expiredCount?: number
  notStartedCount?: number
  averageScore?: number | null
  highestScore?: number | null
  lowestScore?: number | null
  scoreDistribution?: ScoreDistributionBucketDto[]
  questionStats?: QuestionStatItemDto[]
}

function unwrapObject<T extends object>(data: unknown): T | null {
  if (!data || typeof data !== 'object') return null
  const record = data as { data?: unknown }
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as T
  }
  return data as T
}

function normalizeBucket(dto: ScoreDistributionBucketDto): ScoreDistributionBucket | null {
  if (dto.label === undefined || dto.minInclusive === undefined || dto.maxExclusive === undefined) {
    return null
  }
  return {
    label: dto.label,
    minInclusive: dto.minInclusive,
    maxExclusive: dto.maxExclusive,
    count: dto.count ?? 0,
  }
}

function normalizeQuestionStat(dto: QuestionStatItemDto): QuestionStatItem | null {
  if (dto.questionId === undefined || !dto.content) return null
  return {
    questionId: dto.questionId,
    order: dto.order ?? 0,
    content: dto.content,
    rawPoint: dto.rawPoint ?? 0,
    answeredCount: dto.answeredCount ?? 0,
    correctCount: dto.correctCount ?? 0,
    correctRate: dto.correctRate ?? null,
  }
}

function normalizeExamStats(dto: ExamStatsDto): ExamStats | null {
  if (dto.examId === undefined) return null
  return {
    examId: dto.examId,
    examTitle: dto.examTitle ?? '',
    maxScore: dto.maxScore ?? 0,
    classroomId: dto.classroomId ?? null,
    classroomName: dto.classroomName ?? null,
    totalStudents: dto.totalStudents ?? 0,
    submittedCount: dto.submittedCount ?? 0,
    inProgressCount: dto.inProgressCount ?? 0,
    expiredCount: dto.expiredCount ?? 0,
    notStartedCount: dto.notStartedCount ?? 0,
    averageScore: dto.averageScore ?? null,
    highestScore: dto.highestScore ?? null,
    lowestScore: dto.lowestScore ?? null,
    scoreDistribution: (dto.scoreDistribution ?? [])
      .map(normalizeBucket)
      .filter((item): item is ScoreDistributionBucket => item !== null),
    questionStats: (dto.questionStats ?? [])
      .map(normalizeQuestionStat)
      .filter((item): item is QuestionStatItem => item !== null),
  }
}

export async function getExamStats(examId: number, classroomId?: number): Promise<ExamStats> {
  const response = await apiClient.get<unknown>(`/v1/exams/${examId}/stats`, {
    params: classroomId !== undefined ? { classroomId } : undefined,
  })
  const stats = normalizeExamStats(unwrapObject<ExamStatsDto>(response.data) ?? {})
  if (!stats) throw new Error('Không đọc được thống kê bài thi')
  return stats
}
