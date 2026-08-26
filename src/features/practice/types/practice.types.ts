export type ExamPurpose = 'EXAM' | 'PRACTICE'

export type PracticeStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CLOSED'

export type PracticeMode = 'ONLINE' | 'OMR_PAPER'

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'

export type PracticeConfig = {
  showScoreToStudent: boolean
  timeLimitEnabled: boolean
  maxAttempts: number | null
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  paperCount: number
  allowEdit: boolean
  semester: string
  academicYear: string
}

export type PracticeItem = {
  id: number
  title: string
  purpose: 'PRACTICE'
  duration: number
  examMode: PracticeMode
  status: PracticeStatus
  subjectId: number
  subjectName: string
  maxScore: number
  totalQuestions: number
  classroomIds: number[]
  classroomNames: string[]
  createdAt: string
  config: PracticeConfig
  versionCodes: string[]
  questionIds: number[]
}

export type PracticeSubjectOption = {
  id: number
  subjectName: string
}

export type PracticeClassroomOption = {
  id: number
  className: string
  subjectId: number
}

export type PracticeQuestionOption = {
  questionId: number
  content: string
  type: QuestionType
  subjectId: number
}

export type PracticeFormValues = {
  title: string
  duration: number | ''
  examMode: PracticeMode | ''
  subjectId: number | ''
  questionIds: number[]
  maxScore: number | ''
  classroomIds: number[]
  config: {
    showScoreToStudent: boolean
    timeLimitEnabled: boolean
    maxAttempts: number | ''
    shuffleQuestions: boolean
    shuffleAnswers: boolean
    paperCount: number | ''
    allowEdit: boolean
    semester: string
    academicYear: string
  }
}

export type PracticeFormErrors = {
  title?: string
  duration?: string
  examMode?: string
  subjectId?: string
  questionIds?: string
  maxScore?: string
  maxAttempts?: string
  paperCount?: string
}

export type PracticeTakeItem = {
  examId: number
  title: string
  purpose: 'PRACTICE'
  timeLimitEnabled: boolean
  showScoreToStudent: boolean
  attemptNo: number
  maxAttempts: number | null
  duration: number
  startTime: string
  versionCode: string
  questions: {
    questionId: number
    content: string
    type: QuestionType
    options: { label: string; content: string }[]
  }[]
}

export type PracticeSubmissionResult = {
  submissionId: number
  attemptNo: number
  scoreVisible: boolean
  totalScore?: number
  maxScore?: number
  correctQuestions?: number
  totalQuestions?: number
}

export const PRACTICE_STATUS_LABEL: Record<PracticeStatus, string> = {
  DRAFT: 'Nháp',
  UPCOMING: 'Sắp mở',
  ONGOING: 'Đang mở',
  COMPLETED: 'Hoàn thành',
  CLOSED: 'Đã đóng',
}

export const PRACTICE_STATUS_BADGE_CLASS: Record<PracticeStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  UPCOMING: 'bg-sky-50 text-sky-800',
  ONGOING: 'bg-emerald-50 text-emerald-800',
  COMPLETED: 'bg-violet-50 text-violet-800',
  CLOSED: 'bg-red-50 text-red-700',
}

export function formatMaxAttempts(value: number | null | undefined) {
  if (value === null || value === undefined) return 'Không giới hạn'
  return `${value} lần`
}

export function formatTimeLimit(enabled: boolean, duration: number) {
  if (!enabled) return 'Không'
  return `Có (${duration} phút)`
}

export function canRetryPractice(attemptNo: number, maxAttempts: number | null) {
  if (maxAttempts === null) return true
  return attemptNo < maxAttempts
}

/** Mock — Loại A UI only */
export const MOCK_PRACTICE_SUBJECTS: PracticeSubjectOption[] = [
  { id: 1, subjectName: 'Công nghệ phần mềm' },
  { id: 2, subjectName: 'Cơ sở dữ liệu' },
]

export const MOCK_PRACTICE_CLASSROOMS: PracticeClassroomOption[] = [
  { id: 11, className: 'CNPM-K15-01', subjectId: 1 },
  { id: 12, className: 'CNPM-K15-02', subjectId: 1 },
  { id: 21, className: 'CSDL-K14-01', subjectId: 2 },
]

export const MOCK_PRACTICE_QUESTIONS: PracticeQuestionOption[] = [
  {
    questionId: 11,
    content: 'Mục tiêu chính của kiểm thử phần mềm là gì?',
    type: 'SINGLE_CHOICE',
    subjectId: 1,
  },
  {
    questionId: 12,
    content: 'Đâu là đặc điểm của Agile?',
    type: 'MULTIPLE_CHOICE',
    subjectId: 1,
  },
  {
    questionId: 13,
    content: 'UML use case dùng để mô tả gì?',
    type: 'SINGLE_CHOICE',
    subjectId: 1,
  },
  {
    questionId: 21,
    content: 'Khóa chính (PRIMARY KEY) có đặc điểm nào?',
    type: 'SINGLE_CHOICE',
    subjectId: 2,
  },
  {
    questionId: 22,
    content: 'Chọn các loại JOIN đúng',
    type: 'MULTIPLE_CHOICE',
    subjectId: 2,
  },
]

export const MOCK_PRACTICES: PracticeItem[] = [
  {
    id: 501,
    title: 'Luyện chương 1 — Kiểm thử',
    purpose: 'PRACTICE',
    duration: 30,
    examMode: 'ONLINE',
    status: 'ONGOING',
    subjectId: 1,
    subjectName: 'Công nghệ phần mềm',
    maxScore: 10,
    totalQuestions: 3,
    classroomIds: [11, 12],
    classroomNames: ['CNPM-K15-01', 'CNPM-K15-02'],
    createdAt: '2026-08-20T08:00:00',
    versionCodes: ['001', '002'],
    questionIds: [11, 12, 13],
    config: {
      showScoreToStudent: true,
      timeLimitEnabled: false,
      maxAttempts: 3,
      shuffleQuestions: true,
      shuffleAnswers: true,
      paperCount: 2,
      allowEdit: true,
      semester: '1',
      academicYear: '2025-2026',
    },
  },
  {
    id: 502,
    title: 'Luyện SOLID nhanh',
    purpose: 'PRACTICE',
    duration: 20,
    examMode: 'ONLINE',
    status: 'DRAFT',
    subjectId: 1,
    subjectName: 'Công nghệ phần mềm',
    maxScore: 10,
    totalQuestions: 2,
    classroomIds: [],
    classroomNames: [],
    createdAt: '2026-08-22T10:00:00',
    versionCodes: [],
    questionIds: [11, 12],
    config: {
      showScoreToStudent: true,
      timeLimitEnabled: true,
      maxAttempts: null,
      shuffleQuestions: false,
      shuffleAnswers: false,
      paperCount: 1,
      allowEdit: false,
      semester: '1',
      academicYear: '2025-2026',
    },
  },
  {
    id: 503,
    title: 'Ôn SQL cơ bản',
    purpose: 'PRACTICE',
    duration: 45,
    examMode: 'ONLINE',
    status: 'UPCOMING',
    subjectId: 2,
    subjectName: 'Cơ sở dữ liệu',
    maxScore: 10,
    totalQuestions: 2,
    classroomIds: [21],
    classroomNames: ['CSDL-K14-01'],
    createdAt: '2026-08-18T09:00:00',
    versionCodes: ['001'],
    questionIds: [21, 22],
    config: {
      showScoreToStudent: false,
      timeLimitEnabled: true,
      maxAttempts: 1,
      shuffleQuestions: true,
      shuffleAnswers: false,
      paperCount: 1,
      allowEdit: false,
      semester: '2',
      academicYear: '2025-2026',
    },
  },
]

export const MOCK_PRACTICE_TAKE: PracticeTakeItem = {
  examId: 501,
  title: 'Luyện chương 1 — Kiểm thử',
  purpose: 'PRACTICE',
  timeLimitEnabled: false,
  showScoreToStudent: true,
  attemptNo: 1,
  maxAttempts: 3,
  duration: 30,
  startTime: new Date().toISOString(),
  versionCode: '001',
  questions: [
    {
      questionId: 11,
      content: 'Mục tiêu chính của kiểm thử phần mềm là gì?',
      type: 'SINGLE_CHOICE',
      options: [
        { label: 'A', content: 'Chứng minh phần mềm không có lỗi' },
        { label: 'B', content: 'Phát hiện lỗi và giảm rủi ro' },
        { label: 'C', content: 'Viết tài liệu thiết kế' },
        { label: 'D', content: 'Triển khai production' },
      ],
    },
    {
      questionId: 12,
      content: 'Đâu là đặc điểm của Agile?',
      type: 'MULTIPLE_CHOICE',
      options: [
        { label: 'A', content: 'Lặp ngắn (iteration)' },
        { label: 'B', content: 'Tài liệu waterfall đầy đủ trước khi code' },
        { label: 'C', content: 'Phản hồi liên tục từ stakeholder' },
        { label: 'D', content: 'Không cần kiểm thử' },
      ],
    },
  ],
}

export function emptyPracticeFormValues(): PracticeFormValues {
  return {
    title: '',
    duration: 30,
    examMode: 'ONLINE',
    subjectId: '',
    questionIds: [],
    maxScore: 10,
    classroomIds: [],
    config: {
      showScoreToStudent: true,
      timeLimitEnabled: false,
      maxAttempts: '',
      shuffleQuestions: false,
      shuffleAnswers: false,
      paperCount: 1,
      allowEdit: false,
      semester: '1',
      academicYear: '2025-2026',
    },
  }
}

export function practiceToFormValues(item: PracticeItem): PracticeFormValues {
  return {
    title: item.title,
    duration: item.duration,
    examMode: item.examMode,
    subjectId: item.subjectId,
    questionIds: item.questionIds,
    maxScore: item.maxScore,
    classroomIds: item.classroomIds,
    config: {
      showScoreToStudent: item.config.showScoreToStudent,
      timeLimitEnabled: item.config.timeLimitEnabled,
      maxAttempts: item.config.maxAttempts ?? '',
      shuffleQuestions: item.config.shuffleQuestions,
      shuffleAnswers: item.config.shuffleAnswers,
      paperCount: item.config.paperCount,
      allowEdit: item.config.allowEdit,
      semester: item.config.semester,
      academicYear: item.config.academicYear,
    },
  }
}
