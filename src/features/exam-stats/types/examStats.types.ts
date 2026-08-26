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

/** Mock — Loại A UI only. Lớp bắt buộc (cùng UX Chấm điểm). */
export const MOCK_STATS_SUBJECTS: ExamStatsSubjectOption[] = [
  { id: 1, subjectName: 'Công nghệ phần mềm' },
  { id: 2, subjectName: 'Cơ sở dữ liệu' },
  { id: 3, subjectName: 'Toán rời rạc' },
]

export const MOCK_STATS_CLASSROOMS: ExamStatsClassroomOption[] = [
  { id: 11, className: 'CNPM-K15-01', subjectId: 1 },
  { id: 12, className: 'CNPM-K15-02', subjectId: 1 },
  { id: 21, className: 'CSDL-K14-01', subjectId: 2 },
  { id: 31, className: 'TRR-K15-01', subjectId: 3 },
]

export const MOCK_STATS_EXAMS: ExamStatsExamOption[] = [
  {
    id: 101,
    title: 'Kiểm tra giữa kỳ CNPM',
    status: 'ONGOING',
    maxScore: 10,
    classroomIds: [11, 12],
  },
  {
    id: 102,
    title: 'Đề thi cuối kỳ CNPM',
    status: 'CLOSED',
    maxScore: 10,
    classroomIds: [11],
  },
  {
    id: 201,
    title: 'Quiz CSDL buổi 3',
    status: 'COMPLETED',
    maxScore: 10,
    classroomIds: [21],
  },
  {
    id: 301,
    title: 'Kiểm tra nhanh TRR',
    status: 'UPCOMING',
    maxScore: 10,
    classroomIds: [31],
  },
]

/** Đề 101 / lớp 11 — đủ số liệu */
export const MOCK_EXAM_STATS_FULL: ExamStats = {
  examId: 101,
  examTitle: 'Kiểm tra giữa kỳ CNPM',
  maxScore: 10,
  classroomId: 11,
  classroomName: 'CNPM-K15-01',
  totalStudents: 30,
  submittedCount: 22,
  inProgressCount: 3,
  expiredCount: 2,
  notStartedCount: 3,
  averageScore: 7.2,
  highestScore: 9.5,
  lowestScore: 3,
  scoreDistribution: [
    { label: '0–2', minInclusive: 0, maxExclusive: 2, count: 1 },
    { label: '2–4', minInclusive: 2, maxExclusive: 4, count: 2 },
    { label: '4–6', minInclusive: 4, maxExclusive: 6, count: 5 },
    { label: '6–8', minInclusive: 6, maxExclusive: 8, count: 8 },
    { label: '8–10', minInclusive: 8, maxExclusive: 10, count: 5 },
    { label: '10', minInclusive: 10, maxExclusive: 11, count: 1 },
  ],
  questionStats: [
    {
      questionId: 11,
      order: 1,
      content: 'Mục tiêu chính của kiểm thử phần mềm là gì?',
      rawPoint: 2,
      answeredCount: 22,
      correctCount: 18,
      correctRate: 0.82,
    },
    {
      questionId: 12,
      order: 2,
      content: 'Đâu là đặc điểm của Agile?',
      rawPoint: 2,
      answeredCount: 22,
      correctCount: 14,
      correctRate: 0.64,
    },
    {
      questionId: 13,
      order: 3,
      content: 'UML use case dùng để mô tả gì?',
      rawPoint: 2,
      answeredCount: 22,
      correctCount: 9,
      correctRate: 0.41,
    },
    {
      questionId: 14,
      order: 4,
      content: 'Chọn các nguyên tắc SOLID đúng',
      rawPoint: 2,
      answeredCount: 22,
      correctCount: 7,
      correctRate: 0.32,
    },
    {
      questionId: 15,
      order: 5,
      content: 'CI/CD giúp ích gì trong quy trình phát triển?',
      rawPoint: 2,
      answeredCount: 22,
      correctCount: 16,
      correctRate: 0.73,
    },
  ],
}

/** Đề 102 — đã giao lớp nhưng chưa ai nộp */
export const MOCK_EXAM_STATS_NO_SUBMISSIONS: ExamStats = {
  examId: 102,
  examTitle: 'Đề thi cuối kỳ CNPM',
  maxScore: 10,
  classroomId: 11,
  classroomName: 'CNPM-K15-01',
  totalStudents: 28,
  submittedCount: 0,
  inProgressCount: 0,
  expiredCount: 0,
  notStartedCount: 28,
  averageScore: null,
  highestScore: null,
  lowestScore: null,
  scoreDistribution: [
    { label: '0–2', minInclusive: 0, maxExclusive: 2, count: 0 },
    { label: '2–4', minInclusive: 2, maxExclusive: 4, count: 0 },
    { label: '4–6', minInclusive: 4, maxExclusive: 6, count: 0 },
    { label: '6–8', minInclusive: 6, maxExclusive: 8, count: 0 },
    { label: '8–10', minInclusive: 8, maxExclusive: 10, count: 0 },
    { label: '10', minInclusive: 10, maxExclusive: 11, count: 0 },
  ],
  questionStats: [
    {
      questionId: 21,
      order: 1,
      content: 'Waterfall khác Agile ở điểm nào?',
      rawPoint: 2,
      answeredCount: 0,
      correctCount: 0,
      correctRate: null,
    },
    {
      questionId: 22,
      order: 2,
      content: 'Định nghĩa technical debt',
      rawPoint: 2,
      answeredCount: 0,
      correctCount: 0,
      correctRate: null,
    },
  ],
}

/** Đề 201 — lớp chưa có SV */
export const MOCK_EXAM_STATS_EMPTY_CLASS: ExamStats = {
  examId: 201,
  examTitle: 'Quiz CSDL buổi 3',
  maxScore: 10,
  classroomId: 21,
  classroomName: 'CSDL-K14-01',
  totalStudents: 0,
  submittedCount: 0,
  inProgressCount: 0,
  expiredCount: 0,
  notStartedCount: 0,
  averageScore: null,
  highestScore: null,
  lowestScore: null,
  scoreDistribution: [],
  questionStats: [],
}

export function getMockExamStats(examId: number, classroomId: number): ExamStats | null {
  if (examId === 101 && classroomId === 11) return MOCK_EXAM_STATS_FULL
  if (examId === 101 && classroomId === 12) {
    return {
      ...MOCK_EXAM_STATS_FULL,
      classroomId: 12,
      classroomName: 'CNPM-K15-02',
      totalStudents: 26,
      submittedCount: 18,
      inProgressCount: 2,
      expiredCount: 1,
      notStartedCount: 5,
      averageScore: 6.8,
      highestScore: 9,
      lowestScore: 2.5,
    }
  }
  if (examId === 102) return MOCK_EXAM_STATS_NO_SUBMISSIONS
  if (examId === 201) return MOCK_EXAM_STATS_EMPTY_CLASS
  if (examId === 301) {
    return {
      ...MOCK_EXAM_STATS_NO_SUBMISSIONS,
      examId: 301,
      examTitle: 'Kiểm tra nhanh TRR',
      classroomId: 31,
      classroomName: 'TRR-K15-01',
      totalStudents: 20,
      notStartedCount: 20,
    }
  }
  return null
}
