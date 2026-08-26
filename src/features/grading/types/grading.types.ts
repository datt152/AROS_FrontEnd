export type GradingStudentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'EXPIRED' | 'SUBMITTED'

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'

export type GradingSubjectOption = {
  id: number
  subjectName: string
}

export type GradingClassroomOption = {
  id: number
  className: string
  subjectId: number
}

export type GradingExamOption = {
  id: number
  title: string
  status: string
  startAt?: string | null
  endAt?: string | null
  maxScore: number
  classroomIds: number[]
}

export type GradingStudentRow = {
  studentId: number
  fullName: string
  email: string
  studentCode: string
  status: GradingStudentStatus
  submissionId: number | null
  score: number | null
  versionCode: string | null
  startTime: string | null
  submitTime: string | null
}

export type GradingSheet = {
  examId: number
  examTitle: string
  classroomId: number
  classroomName: string
  maxScore: number
  students: GradingStudentRow[]
}

export type SubmissionDetailItem = {
  questionId: number
  order: number
  content: string
  type: QuestionType
  selectedAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
  rawPoint: number
}

export type SubmissionDetail = {
  submissionId: number
  examId: number
  examTitle: string
  versionCode: string
  studentId: number
  fullName: string
  email: string
  studentCode: string
  status: GradingStudentStatus
  score: number | null
  maxScore: number
  correctQuestions: number
  totalQuestions: number
  startTime: string | null
  submitTime: string | null
  details: SubmissionDetailItem[]
}

export type GradingSummaryCounts = {
  total: number
  submitted: number
  inProgress: number
  expired: number
  notStarted: number
}

export const GRADING_STATUS_LABEL: Record<GradingStudentStatus, string> = {
  NOT_STARTED: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  EXPIRED: 'Hết giờ / chưa nộp',
  SUBMITTED: 'Đã nộp',
}

export const GRADING_STATUS_BADGE_CLASS: Record<GradingStudentStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-amber-50 text-amber-800',
  EXPIRED: 'bg-red-50 text-red-700',
  SUBMITTED: 'bg-emerald-50 text-emerald-800',
}

export function formatGradingDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatScoreDisplay(score: number | null | undefined, maxScore: number, status: GradingStudentStatus) {
  if (status === 'EXPIRED' || status === 'NOT_STARTED' || status === 'IN_PROGRESS') return '—'
  if (score === null || score === undefined) return '—'
  return `${score}/${maxScore}`
}

export function canViewSubmission(student: GradingStudentRow) {
  return Boolean(student.submissionId) && student.status === 'SUBMITTED'
}

export function summarizeGradingStudents(students: GradingStudentRow[]): GradingSummaryCounts {
  return students.reduce(
    (acc, student) => {
      acc.total += 1
      if (student.status === 'SUBMITTED') acc.submitted += 1
      else if (student.status === 'IN_PROGRESS') acc.inProgress += 1
      else if (student.status === 'EXPIRED') acc.expired += 1
      else acc.notStarted += 1
      return acc
    },
    { total: 0, submitted: 0, inProgress: 0, expired: 0, notStarted: 0 },
  )
}

/** Mock — Loại A UI only */
export const MOCK_GRADING_SUBJECTS: GradingSubjectOption[] = [
  { id: 1, subjectName: 'Công nghệ phần mềm' },
  { id: 2, subjectName: 'Cơ sở dữ liệu' },
  { id: 3, subjectName: 'Toán rời rạc' },
]

export const MOCK_GRADING_CLASSROOMS: GradingClassroomOption[] = [
  { id: 11, className: 'CNPM-K15-01', subjectId: 1 },
  { id: 12, className: 'CNPM-K15-02', subjectId: 1 },
  { id: 21, className: 'CSDL-K14-01', subjectId: 2 },
  { id: 31, className: 'TRR-K15-01', subjectId: 3 },
]

export const MOCK_GRADING_EXAMS: GradingExamOption[] = [
  {
    id: 101,
    title: 'Kiểm tra giữa kỳ CNPM',
    status: 'ONGOING',
    startAt: '2026-08-20T08:00:00',
    endAt: '2026-08-20T09:30:00',
    maxScore: 10,
    classroomIds: [11, 12],
  },
  {
    id: 102,
    title: 'Đề thi cuối kỳ CNPM',
    status: 'CLOSED',
    startAt: '2026-07-10T07:30:00',
    endAt: '2026-07-10T09:30:00',
    maxScore: 10,
    classroomIds: [11],
  },
  {
    id: 201,
    title: 'Quiz CSDL buổi 3',
    status: 'COMPLETED',
    startAt: '2026-08-01T13:00:00',
    endAt: '2026-08-01T13:45:00',
    maxScore: 10,
    classroomIds: [21],
  },
]

export const MOCK_GRADING_SHEET: GradingSheet = {
  examId: 101,
  examTitle: 'Kiểm tra giữa kỳ CNPM',
  classroomId: 11,
  classroomName: 'CNPM-K15-01',
  maxScore: 10,
  students: [
    {
      studentId: 1001,
      fullName: 'Nguyễn Văn An',
      email: 'an.nguyen@student.edu.vn',
      studentCode: 'SV001',
      status: 'SUBMITTED',
      submissionId: 501,
      score: 8.5,
      versionCode: '001',
      startTime: '2026-08-20T08:02:00',
      submitTime: '2026-08-20T08:41:00',
    },
    {
      studentId: 1002,
      fullName: 'Trần Thị Bình',
      email: 'binh.tran@student.edu.vn',
      studentCode: 'SV002',
      status: 'SUBMITTED',
      submissionId: 502,
      score: 7,
      versionCode: '002',
      startTime: '2026-08-20T08:05:00',
      submitTime: '2026-08-20T08:55:00',
    },
    {
      studentId: 1003,
      fullName: 'Lê Minh Châu',
      email: 'chau.le@student.edu.vn',
      studentCode: 'SV003',
      status: 'IN_PROGRESS',
      submissionId: 503,
      score: null,
      versionCode: '001',
      startTime: '2026-08-20T08:10:00',
      submitTime: null,
    },
    {
      studentId: 1004,
      fullName: 'Phạm Quốc Dũng',
      email: 'dung.pham@student.edu.vn',
      studentCode: 'SV004',
      status: 'EXPIRED',
      submissionId: 504,
      score: null,
      versionCode: '003',
      startTime: '2026-08-20T08:01:00',
      submitTime: null,
    },
    {
      studentId: 1005,
      fullName: 'Hoàng Thu Hà',
      email: 'ha.hoang@student.edu.vn',
      studentCode: 'SV005',
      status: 'NOT_STARTED',
      submissionId: null,
      score: null,
      versionCode: null,
      startTime: null,
      submitTime: null,
    },
    {
      studentId: 1006,
      fullName: 'Võ Anh Khoa',
      email: 'khoa.vo@student.edu.vn',
      studentCode: 'SV006',
      status: 'SUBMITTED',
      submissionId: 506,
      score: 9.5,
      versionCode: '001',
      startTime: '2026-08-20T08:00:30',
      submitTime: '2026-08-20T08:28:00',
    },
  ],
}

export const MOCK_SUBMISSION_DETAILS: Record<number, SubmissionDetail> = {
  501: {
    submissionId: 501,
    examId: 101,
    examTitle: 'Kiểm tra giữa kỳ CNPM',
    versionCode: '001',
    studentId: 1001,
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@student.edu.vn',
    studentCode: 'SV001',
    status: 'SUBMITTED',
    score: 8.5,
    maxScore: 10,
    correctQuestions: 4,
    totalQuestions: 5,
    startTime: '2026-08-20T08:02:00',
    submitTime: '2026-08-20T08:41:00',
    details: [
      {
        questionId: 11,
        order: 1,
        content: 'Mục tiêu chính của kiểm thử phần mềm là gì?',
        type: 'SINGLE_CHOICE',
        selectedAnswer: 'B',
        correctAnswer: 'B',
        isCorrect: true,
        rawPoint: 2,
      },
      {
        questionId: 12,
        order: 2,
        content: 'Đâu là đặc điểm của Agile?',
        type: 'MULTIPLE_CHOICE',
        selectedAnswer: 'A,C',
        correctAnswer: 'A,C',
        isCorrect: true,
        rawPoint: 2,
      },
      {
        questionId: 13,
        order: 3,
        content: 'UML use case dùng để mô tả gì?',
        type: 'SINGLE_CHOICE',
        selectedAnswer: 'A',
        correctAnswer: 'C',
        isCorrect: false,
        rawPoint: 2,
      },
      {
        questionId: 14,
        order: 4,
        content: 'Chọn các nguyên tắc SOLID đúng',
        type: 'MULTIPLE_CHOICE',
        selectedAnswer: 'A,B',
        correctAnswer: 'A,B,D',
        isCorrect: false,
        rawPoint: 2,
      },
      {
        questionId: 15,
        order: 5,
        content: 'CI/CD giúp ích gì trong quy trình phát triển?',
        type: 'SINGLE_CHOICE',
        selectedAnswer: 'D',
        correctAnswer: 'D',
        isCorrect: true,
        rawPoint: 2,
      },
    ],
  },
  502: {
    submissionId: 502,
    examId: 101,
    examTitle: 'Kiểm tra giữa kỳ CNPM',
    versionCode: '002',
    studentId: 1002,
    fullName: 'Trần Thị Bình',
    email: 'binh.tran@student.edu.vn',
    studentCode: 'SV002',
    status: 'SUBMITTED',
    score: 7,
    maxScore: 10,
    correctQuestions: 3,
    totalQuestions: 5,
    startTime: '2026-08-20T08:05:00',
    submitTime: '2026-08-20T08:55:00',
    details: [
      {
        questionId: 11,
        order: 1,
        content: 'Mục tiêu chính của kiểm thử phần mềm là gì?',
        type: 'SINGLE_CHOICE',
        selectedAnswer: 'B',
        correctAnswer: 'B',
        isCorrect: true,
        rawPoint: 2,
      },
      {
        questionId: 12,
        order: 2,
        content: 'Đâu là đặc điểm của Agile?',
        type: 'MULTIPLE_CHOICE',
        selectedAnswer: 'A',
        correctAnswer: 'A,C',
        isCorrect: false,
        rawPoint: 2,
      },
      {
        questionId: 13,
        order: 3,
        content: 'UML use case dùng để mô tả gì?',
        type: 'SINGLE_CHOICE',
        selectedAnswer: 'C',
        correctAnswer: 'C',
        isCorrect: true,
        rawPoint: 2,
      },
      {
        questionId: 14,
        order: 4,
        content: 'Chọn các nguyên tắc SOLID đúng',
        type: 'MULTIPLE_CHOICE',
        selectedAnswer: 'A,B,D',
        correctAnswer: 'A,B,D',
        isCorrect: true,
        rawPoint: 2,
      },
      {
        questionId: 15,
        order: 5,
        content: 'CI/CD giúp ích gì trong quy trình phát triển?',
        type: 'SINGLE_CHOICE',
        selectedAnswer: 'A',
        correctAnswer: 'D',
        isCorrect: false,
        rawPoint: 2,
      },
    ],
  },
  506: {
    submissionId: 506,
    examId: 101,
    examTitle: 'Kiểm tra giữa kỳ CNPM',
    versionCode: '001',
    studentId: 1006,
    fullName: 'Võ Anh Khoa',
    email: 'khoa.vo@student.edu.vn',
    studentCode: 'SV006',
    status: 'SUBMITTED',
    score: 9.5,
    maxScore: 10,
    correctQuestions: 5,
    totalQuestions: 5,
    startTime: '2026-08-20T08:00:30',
    submitTime: '2026-08-20T08:28:00',
    details: [
      {
        questionId: 11,
        order: 1,
        content: 'Mục tiêu chính của kiểm thử phần mềm là gì?',
        type: 'SINGLE_CHOICE',
        selectedAnswer: 'B',
        correctAnswer: 'B',
        isCorrect: true,
        rawPoint: 2,
      },
      {
        questionId: 12,
        order: 2,
        content: 'Đâu là đặc điểm của Agile?',
        type: 'MULTIPLE_CHOICE',
        selectedAnswer: 'A,C',
        correctAnswer: 'A,C',
        isCorrect: true,
        rawPoint: 2,
      },
      {
        questionId: 13,
        order: 3,
        content: 'UML use case dùng để mô tả gì?',
        type: 'SINGLE_CHOICE',
        selectedAnswer: 'C',
        correctAnswer: 'C',
        isCorrect: true,
        rawPoint: 2,
      },
      {
        questionId: 14,
        order: 4,
        content: 'Chọn các nguyên tắc SOLID đúng',
        type: 'MULTIPLE_CHOICE',
        selectedAnswer: 'A,B,D',
        correctAnswer: 'A,B,D',
        isCorrect: true,
        rawPoint: 2,
      },
      {
        questionId: 15,
        order: 5,
        content: 'CI/CD giúp ích gì trong quy trình phát triển?',
        type: 'SINGLE_CHOICE',
        selectedAnswer: 'D',
        correctAnswer: 'D',
        isCorrect: true,
        rawPoint: 2,
      },
    ],
  },
}
