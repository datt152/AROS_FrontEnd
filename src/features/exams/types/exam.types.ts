export type ExamMode = 'ONLINE' | 'OMR_PAPER'

export type ExamStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CLOSED'

export type ExamPurpose = 'EXAM' | 'PRACTICE'

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'

/** Cấu hình làm bài Online (và PRACTICE) */
export type ExamOnlineSettings = {
  status?: ExamStatus
  startAt?: string | null
  endAt?: string | null
  allowEdit?: boolean
  showScoreToStudent?: boolean
  maxAttempts?: number | null
  timeLimitEnabled?: boolean
}

/** Cấu hình in đề / sinh mã đề (OMR bắt buộc; Online nên gửi khi sinh mã) */
export type ExamPaperSettings = {
  examDate?: string | null
  semester?: string
  academicYear?: string
  shuffleQuestions?: boolean
  shuffleAnswers?: boolean
  paperCount?: number
}

export type ExamItem = {
  id: number
  title: string
  duration: number
  examMode: ExamMode
  purpose?: ExamPurpose
  /** Convenience từ BE (Online); OMR thường DRAFT/null schedule */
  status: ExamStatus
  subjectId: number
  subjectName?: string
  teacherEmail?: string
  createdAt: string
  startAt?: string | null
  endAt?: string | null
  totalQuestions: number
  maxScore: number
  classroomIds?: number[]
  onlineSettings?: ExamOnlineSettings | null
  paperSettings?: ExamPaperSettings | null
  versionCodes?: string[]
  questionIds?: number[]
  /** Có khi GET detail nhúng danh sách câu hỏi */
  questions?: QuestionPickItem[]
  hasSubmissions?: boolean
  sourceTemplateId?: number | null
}

export type QuestionPickItem = {
  questionId: number
  content: string
  type: QuestionType
  difficulty?: string
  subjectId: number
  topicId?: number | null
  topicName?: string | null
}

export type SubjectOption = {
  id: number
  subjectName: string
}

export type ClassroomOption = {
  id: number
  className: string
  subjectId: number
  subjectName?: string
}

export type ExamOnlineFormValues = {
  allowEdit: boolean
  showScoreToStudent: boolean
  maxAttempts: number | ''
  timeLimitEnabled: boolean
}

export type ExamPaperFormValues = {
  examDate: string
  semester: string
  academicYear: string
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  paperCount: number | ''
}

export type ExamCreateFormValues = {
  title: string
  duration: number | ''
  examMode: ExamMode | ''
  subjectId: number | ''
  questionIds: number[]
  maxScore: number | ''
  rawPoints: Record<number, number>
  classroomIds: number[]
  onlineSettings: ExamOnlineFormValues
  paperSettings: ExamPaperFormValues
}

export type ExamUpdateFormValues = {
  title: string
  duration: number | ''
  examMode: ExamMode | ''
  subjectId: number | ''
  maxScore: number | ''
  onlineSettings?: ExamOnlineFormValues
  paperSettings?: ExamPaperFormValues
}

/** POST /api/v1/exams */
export type ExamCreatePayload = {
  title: string
  duration: number
  examMode: ExamMode
  purpose?: ExamPurpose
  subjectId: number
  questionIds: number[]
  maxScore: number
  rawPoints?: Record<string, number>
  classroomIds?: number[]
  onlineSettings?: ExamOnlineSettings
  paperSettings?: ExamPaperSettings
}

/** PUT /api/v1/exams/{id} — full required meta fields */
export type ExamUpdatePayload = {
  title: string
  duration: number
  examMode: ExamMode
  subjectId: number
  maxScore: number
  onlineSettings?: ExamOnlineSettings | null
  paperSettings?: ExamPaperSettings | null
}

export type ExamVersionCreatePayload = {
  examId: number
  manualVersionCodes?: string[]
  autoGenerateCount?: number
  replaceExisting?: boolean
}

export type SubmissionPayload = {
  examId: number
  classroomId: number
  versionCode: string
  answers: Record<string, string>
}

export type ExamFormErrors = {
  title?: string
  duration?: string
  examMode?: string
  subjectId?: string
  questionIds?: string
  maxScore?: string
  paperCount?: string
  maxAttempts?: string
  examDate?: string
}

export type ExamVersionCreateValues = {
  mode: 'manual' | 'auto'
  manualVersionCodes: string[]
  autoGenerateCount: number | ''
  replaceExisting: boolean
}

export type ExamVersionCreateErrors = {
  mode?: string
  manualVersionCodes?: string
  autoGenerateCount?: string
}

export type ExamOpenValues = {
  status: 'UPCOMING' | 'ONGOING'
  startAt: string
  endAt: string
}

export type ExamOpenErrors = {
  status?: string
  startAt?: string
  endAt?: string
}

export type ExamVersionDetailItem = {
  examId: number
  title: string
  duration: number
  versionCode: string
  questions: {
    originalQuestionId: number
    content: string
    type: QuestionType
    options: { label: string; content: string }[]
  }[]
}

export type ExamTakeItem = {
  examId: number
  classroomId?: number | null
  classroomName?: string | null
  title: string
  duration: number
  versionCode: string
  startTime: string
  purpose?: ExamPurpose
  timeLimitEnabled?: boolean
  showScoreToStudent?: boolean
  attemptNo?: number
  maxAttempts?: number | null
  questions: {
    questionId: number
    content: string
    type: QuestionType
    options: { label: string; content: string }[]
  }[]
}

export type SubmissionResultItem = {
  submissionId: number
  classroomId?: number | null
  attemptNo?: number
  scoreVisible?: boolean
  totalScore?: number | null
  maxScore?: number | null
  correctQuestions?: number | null
  totalQuestions?: number | null
}

export const EXAM_MODE_LABEL: Record<ExamMode, string> = {
  ONLINE: 'Trực tuyến',
  OMR_PAPER: 'OMR / Giấy',
}

export const EXAM_MODE_BADGE_CLASS: Record<ExamMode, string> = {
  ONLINE: 'bg-sky-50 text-sky-700',
  OMR_PAPER: 'bg-violet-50 text-violet-700',
}

export const EXAM_STATUS_LABEL: Record<ExamStatus, string> = {
  DRAFT: 'Nháp',
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang mở',
  COMPLETED: 'Hoàn thành',
  CLOSED: 'Đã đóng',
}

export const EXAM_STATUS_BADGE_CLASS: Record<ExamStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  UPCOMING: 'bg-sky-50 text-sky-700',
  ONGOING: 'bg-emerald-50 text-emerald-700',
  COMPLETED: 'bg-violet-50 text-violet-700',
  CLOSED: 'bg-red-50 text-red-700',
}

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE_CHOICE: 'Một đáp án',
  MULTIPLE_CHOICE: 'Nhiều đáp án',
}

export const MOCK_SUBJECTS: SubjectOption[] = [
  { id: 1, subjectName: 'Công nghệ phần mềm' },
  { id: 2, subjectName: 'Cơ sở dữ liệu' },
  { id: 3, subjectName: 'Phát triển Web' },
]

export const MOCK_CLASSROOMS: ClassroomOption[] = [
  { id: 11, className: 'SE2024-CLC01', subjectId: 1, subjectName: 'Công nghệ phần mềm' },
  { id: 12, className: 'SE2024-CLC02', subjectId: 1, subjectName: 'Công nghệ phần mềm' },
  { id: 21, className: 'DB2024-01', subjectId: 2, subjectName: 'Cơ sở dữ liệu' },
  { id: 22, className: 'DB2024-02', subjectId: 2, subjectName: 'Cơ sở dữ liệu' },
  { id: 31, className: 'WEB2024-A', subjectId: 3, subjectName: 'Phát triển Web' },
  { id: 32, className: 'WEB2024-B', subjectId: 3, subjectName: 'Phát triển Web' },
]

export const MOCK_QUESTIONS: QuestionPickItem[] = [
  { questionId: 101, subjectId: 1, content: 'Yêu cầu phần mềm mô tả điều gì?', type: 'SINGLE_CHOICE', difficulty: 'EASY' },
  { questionId: 102, subjectId: 1, content: 'Chọn các hoạt động thuộc vòng đời phát triển phần mềm.', type: 'MULTIPLE_CHOICE', difficulty: 'MEDIUM' },
  { questionId: 103, subjectId: 1, content: 'Nguyên tắc nào thuộc SOLID?', type: 'SINGLE_CHOICE', difficulty: 'HARD' },
  { questionId: 104, subjectId: 1, content: 'Đâu là lợi ích của kiểm thử tự động?', type: 'MULTIPLE_CHOICE', difficulty: 'MEDIUM' },
  { questionId: 201, subjectId: 2, content: 'ACID trong giao dịch CSDL viết tắt của gì?', type: 'SINGLE_CHOICE', difficulty: 'HARD' },
  { questionId: 202, subjectId: 2, content: 'Khóa chính có những đặc điểm nào?', type: 'MULTIPLE_CHOICE', difficulty: 'MEDIUM' },
  { questionId: 203, subjectId: 2, content: 'Chuẩn hóa 3NF loại bỏ điều gì?', type: 'SINGLE_CHOICE', difficulty: 'HARD' },
  { questionId: 204, subjectId: 2, content: 'Index giúp cải thiện thao tác nào?', type: 'SINGLE_CHOICE', difficulty: 'EASY' },
  { questionId: 301, subjectId: 3, content: 'HTTP method nào thường dùng để tạo resource?', type: 'SINGLE_CHOICE', difficulty: 'EASY' },
  { questionId: 302, subjectId: 3, content: 'Chọn cách lưu dữ liệu phía client trong SPA.', type: 'MULTIPLE_CHOICE', difficulty: 'VERY_HARD' },
  { questionId: 303, subjectId: 3, content: 'CORS dùng để làm gì?', type: 'SINGLE_CHOICE', difficulty: 'MEDIUM' },
  { questionId: 304, subjectId: 3, content: 'JWT thường được gửi ở đâu?', type: 'SINGLE_CHOICE', difficulty: 'MEDIUM' },
]

const defaultOnline = (partial?: Partial<ExamOnlineSettings>): ExamOnlineSettings => ({
  allowEdit: false,
  showScoreToStudent: true,
  timeLimitEnabled: true,
  maxAttempts: 1,
  ...partial,
})

const defaultPaper = (partial?: Partial<ExamPaperSettings>): ExamPaperSettings => ({
  shuffleQuestions: false,
  shuffleAnswers: false,
  paperCount: 1,
  semester: '1',
  academicYear: '2025-2026',
  ...partial,
})

export const MOCK_EXAMS: ExamItem[] = [
  {
    id: 1,
    title: 'Giữa kỳ CNPM — HK1',
    duration: 60,
    examMode: 'ONLINE',
    status: 'ONGOING',
    subjectId: 1,
    subjectName: 'Công nghệ phần mềm',
    teacherEmail: 'gv.cnpm@school.edu.vn',
    createdAt: '2026-08-01T08:00:00Z',
    startAt: '2026-08-25T08:00:00Z',
    endAt: '2026-08-25T10:00:00Z',
    totalQuestions: 3,
    maxScore: 10,
    classroomIds: [11, 12],
    versionCodes: ['A', 'B'],
    questionIds: [101, 102, 103],
    hasSubmissions: true,
    onlineSettings: defaultOnline({
      status: 'ONGOING',
      startAt: '2026-08-25T08:00:00Z',
      endAt: '2026-08-25T10:00:00Z',
      showScoreToStudent: true,
    }),
    paperSettings: defaultPaper({ shuffleQuestions: true }),
  },
  {
    id: 2,
    title: 'Cuối kỳ CSDL — OMR',
    duration: 90,
    examMode: 'OMR_PAPER',
    status: 'DRAFT',
    subjectId: 2,
    subjectName: 'Cơ sở dữ liệu',
    teacherEmail: 'gv.csdl@school.edu.vn',
    createdAt: '2026-08-05T09:30:00Z',
    startAt: null,
    endAt: null,
    totalQuestions: 2,
    maxScore: 10,
    classroomIds: [21],
    versionCodes: ['101'],
    questionIds: [201, 202],
    hasSubmissions: false,
    paperSettings: defaultPaper({
      paperCount: 3,
      shuffleAnswers: true,
      examDate: '2026-09-01',
    }),
  },
]

export const MOCK_VERSION_DETAILS: Record<string, ExamVersionDetailItem> = {
  '1:A': {
    examId: 1,
    title: 'Giữa kỳ CNPM — HK1',
    duration: 60,
    versionCode: 'A',
    questions: [
      {
        originalQuestionId: 101,
        content: 'Yêu cầu phần mềm mô tả điều gì?',
        type: 'SINGLE_CHOICE',
        options: [
          { label: 'A', content: 'Cách format code' },
          { label: 'B', content: 'Những gì hệ thống cần làm' },
          { label: 'C', content: 'Script triển khai' },
        ],
      },
      {
        originalQuestionId: 102,
        content: 'Chọn các hoạt động thuộc vòng đời phát triển phần mềm.',
        type: 'MULTIPLE_CHOICE',
        options: [
          { label: 'A', content: 'Phân tích yêu cầu' },
          { label: 'B', content: 'Thiết kế' },
          { label: 'C', content: 'Hàn mạch phần cứng' },
          { label: 'D', content: 'Kiểm thử' },
        ],
      },
      {
        originalQuestionId: 103,
        content: 'Nguyên tắc nào thuộc SOLID?',
        type: 'SINGLE_CHOICE',
        options: [
          { label: 'A', content: 'Single Responsibility' },
          { label: 'B', content: 'Shared Database' },
          { label: 'C', content: 'Static Only' },
        ],
      },
    ],
  },
}

export const MOCK_TAKE_EXAM: ExamTakeItem = {
  examId: 1,
  title: 'Giữa kỳ CNPM — HK1',
  duration: 60,
  versionCode: 'A',
  startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  questions: [
    {
      questionId: 101,
      content: 'Yêu cầu phần mềm mô tả điều gì?',
      type: 'SINGLE_CHOICE',
      options: [
        { label: 'A', content: 'Cách format code' },
        { label: 'B', content: 'Những gì hệ thống cần làm' },
        { label: 'C', content: 'Script triển khai' },
      ],
    },
    {
      questionId: 102,
      content: 'Chọn các hoạt động thuộc vòng đời phát triển phần mềm.',
      type: 'MULTIPLE_CHOICE',
      options: [
        { label: 'A', content: 'Phân tích yêu cầu' },
        { label: 'B', content: 'Thiết kế' },
        { label: 'C', content: 'Hàn mạch phần cứng' },
        { label: 'D', content: 'Kiểm thử' },
      ],
    },
  ],
}

export const MOCK_SUBMISSION_RESULT: SubmissionResultItem = {
  submissionId: 9001,
  totalScore: 7.5,
  maxScore: 10,
  correctQuestions: 2,
  totalQuestions: 3,
}

export function formatExamDate(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Ngày thi OMR / date-only fields — không kèm giờ. */
export function formatExamDateOnly(iso?: string | null) {
  if (!iso) return '—'
  try {
    const datePart = iso.slice(0, 10)
    const [y, m, d] = datePart.split('-').map(Number)
    if (!y || !m || !d) return iso
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(y, m - 1, d))
  } catch {
    return iso
  }
}

export function formatExamSchedule(startAt?: string | null, endAt?: string | null) {
  if (!startAt && !endAt) return 'Chưa đặt lịch'
  if (startAt && endAt) return `${formatExamDate(startAt)} → ${formatExamDate(endAt)}`
  return formatExamDate(startAt ?? endAt)
}

export function canOpenExam(exam: ExamItem) {
  const hasClassrooms = (exam.classroomIds?.length ?? 0) > 0
  const hasVersions = (exam.versionCodes?.length ?? 0) > 0
  return {
    hasClassrooms,
    hasVersions,
    ready: hasClassrooms && hasVersions,
  }
}

export function getOpenExamBlockReason(exam: ExamItem) {
  const { hasClassrooms, hasVersions } = canOpenExam(exam)
  if (!hasClassrooms && !hasVersions) return 'Cần giao ít nhất 1 lớp và sinh mã đề trước'
  if (!hasClassrooms) return 'Cần giao ít nhất 1 lớp'
  if (!hasVersions) return 'Cần sinh mã đề trước'
  return null
}

/** Map lỗi take/submit từ message tiếng Việt backend (thường HTTP 500, chưa có errorCode). */
export function mapExamTakeError(messageOrCode: string) {
  const text = messageOrCode.trim()
  const byCode: Record<string, string> = {
    DRAFT: 'Đề thi còn ở trạng thái nháp.',
    CLOSED: 'Đề thi đã đóng.',
    COMPLETED: 'Đề thi đã hoàn thành.',
    OUT_OF_WINDOW: 'Ngoài khung giờ làm bài.',
    NOT_ENROLLED: 'Bạn không thuộc lớp được giao đề.',
    NO_CLASSROOM: 'Đề chưa được giao cho lớp nào.',
    NO_VERSION: 'Đề chưa có mã đề.',
    ALREADY_SUBMITTED: 'Bạn đã nộp bài cho đề này.',
    TIME_UP: 'Đã hết giờ làm bài.',
  }
  if (byCode[text]) return byCode[text]

  const patterns: { match: string; label: string }[] = [
    { match: 'Bài thi chưa được mở (DRAFT)', label: 'Đề thi còn ở trạng thái nháp.' },
    { match: 'Bạn không thuộc lớp được giao đề thi này', label: 'Bạn không thuộc lớp được giao đề.' },
    { match: 'Đề thi chưa được giao cho lớp nào', label: 'Đề chưa được giao cho lớp nào.' },
    { match: 'Bạn đã nộp bài thi này rồi', label: 'Bạn đã nộp bài cho đề này.' },
    { match: 'Đã hết thời gian làm bài', label: 'Đã hết giờ làm bài.' },
    { match: 'Bài thi chưa được tạo mã đề', label: 'Đề chưa có mã đề.' },
  ]

  for (const pattern of patterns) {
    if (text.includes(pattern.match)) return pattern.label
  }

  return text || 'Không thể vào làm bài.'
}

export function answersToSubmitPayload(answers: Record<number, string | string[]>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(answers).map(([questionId, value]) => [
      String(questionId),
      Array.isArray(value) ? value.join(',') : value,
    ]),
  )
}
