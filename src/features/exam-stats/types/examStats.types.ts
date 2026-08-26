export type ExamStatsSubjectOption = {
  id: number
  subjectName: string
}

export type ExamStatsClassroomOption = {
  id: number
  className: string
  subjectId: number
}

export type ExamStatsExamOption = {
  id: number
  title: string
  status: string
  maxScore: number
  classroomIds: number[]
}

export type ScoreDistributionBucket = {
  label: string
  minInclusive: number
  maxExclusive: number
  count: number
}

export type QuestionStatItem = {
  questionId: number
  order: number
  content: string
  rawPoint: number
  answeredCount: number
  correctCount: number
  correctRate: number | null
}

export type ExamStats = {
  examId: number
  examTitle: string
  maxScore: number
  classroomId: number | null
  classroomName: string | null
  totalStudents: number
  submittedCount: number
  inProgressCount: number
  expiredCount: number
  notStartedCount: number
  averageScore: number | null
  highestScore: number | null
  lowestScore: number | null
  scoreDistribution: ScoreDistributionBucket[]
  questionStats: QuestionStatItem[]
}

export function formatCorrectRate(rate: number | null | undefined) {
  if (rate === null || rate === undefined) return '—'
  return `${Math.round(rate * 100)}%`
}

export function formatScoreMetric(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function isHardQuestion(rate: number | null | undefined) {
  return rate !== null && rate !== undefined && rate < 0.5
}
