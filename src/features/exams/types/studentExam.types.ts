/** Types + mock cho UI bài thi sinh viên (Loại A — chưa nối API). */

export type StudentExamStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CLOSED'

export type StudentMyStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'EXPIRED' | 'SUBMITTED'

export type StudentClassroomSubject = {
  id: string
  classroomId: number
  classroomName: string
  subjectId: number
  subjectName: string
  teacherName: string
  examCount: number
}

export type StudentExamListItem = {
  id: number
  title: string
  duration: number
  totalQuestions: number
  maxScore: number
  startAt: string
  endAt: string
  examStatus: StudentExamStatus
  myStatus: StudentMyStatus
  /** true chỉ khi lịch/status cho phép làm (đóng / hết hạn / DRAFT → false) */
  canTake: boolean
  classroomSubjectId: string
}

export const STUDENT_EXAM_STATUS_LABEL: Record<StudentExamStatus, string> = {
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
  CLOSED: 'Đã đóng',
}

export const STUDENT_EXAM_STATUS_BADGE: Record<StudentExamStatus, string> = {
  UPCOMING: 'bg-sky-50 text-sky-800 border-sky-200',
  ONGOING: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  CLOSED: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const STUDENT_MY_STATUS_LABEL: Record<StudentMyStatus, string> = {
  NOT_STARTED: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  EXPIRED: 'Hết hạn',
  SUBMITTED: 'Đã nộp',
}

export const STUDENT_MY_STATUS_BADGE: Record<StudentMyStatus, string> = {
  NOT_STARTED: 'bg-amber-50 text-amber-800 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200',
  SUBMITTED: 'bg-violet-50 text-violet-800 border-violet-200',
}

export const MOCK_STUDENT_CLASSROOM_SUBJECTS: StudentClassroomSubject[] = [
  {
    id: 'cs-1',
    classroomId: 101,
    classroomName: 'SE1722',
    subjectId: 3,
    subjectName: 'Cấu trúc dữ liệu',
    teacherName: 'Nguyễn Văn A',
    examCount: 4,
  },
  {
    id: 'cs-2',
    classroomId: 102,
    classroomName: 'SE1723',
    subjectId: 5,
    subjectName: 'Cơ sở dữ liệu',
    teacherName: 'Trần Thị B',
    examCount: 3,
  },
  {
    id: 'cs-3',
    classroomId: 103,
    classroomName: 'AI1701',
    subjectId: 8,
    subjectName: 'Trí tuệ nhân tạo',
    teacherName: 'Lê Minh C',
    examCount: 2,
  },
]

/** Đủ tổ hợp examStatus × myStatus × canTake để test UI */
export const MOCK_STUDENT_EXAMS: StudentExamListItem[] = [
  {
    id: 1001,
    title: 'Giữa kỳ — Cây và đồ thị',
    duration: 60,
    totalQuestions: 40,
    maxScore: 10,
    startAt: '2026-09-01T08:00:00+07:00',
    endAt: '2026-09-01T09:30:00+07:00',
    examStatus: 'ONGOING',
    myStatus: 'NOT_STARTED',
    canTake: true,
    classroomSubjectId: 'cs-1',
  },
  {
    id: 1002,
    title: 'Quiz tuần 3 — Sorting',
    duration: 30,
    totalQuestions: 20,
    maxScore: 10,
    startAt: '2026-08-20T13:00:00+07:00',
    endAt: '2026-08-20T13:45:00+07:00',
    examStatus: 'ONGOING',
    myStatus: 'IN_PROGRESS',
    canTake: true,
    classroomSubjectId: 'cs-1',
  },
  {
    id: 1003,
    title: 'Kiểm tra nhanh — Linked list',
    duration: 20,
    totalQuestions: 15,
    maxScore: 10,
    startAt: '2026-09-10T09:00:00+07:00',
    endAt: '2026-09-10T09:30:00+07:00',
    examStatus: 'UPCOMING',
    myStatus: 'NOT_STARTED',
    canTake: false,
    classroomSubjectId: 'cs-1',
  },
  {
    id: 1004,
    title: 'Cuối kỳ — Ôn tập tổng hợp',
    duration: 90,
    totalQuestions: 50,
    maxScore: 10,
    startAt: '2026-07-15T08:00:00+07:00',
    endAt: '2026-07-15T10:00:00+07:00',
    examStatus: 'COMPLETED',
    myStatus: 'SUBMITTED',
    canTake: false,
    classroomSubjectId: 'cs-1',
  },
  {
    id: 2001,
    title: 'Giữa kỳ — SQL cơ bản',
    duration: 45,
    totalQuestions: 30,
    maxScore: 10,
    startAt: '2026-08-25T14:00:00+07:00',
    endAt: '2026-08-25T15:00:00+07:00',
    examStatus: 'CLOSED',
    myStatus: 'EXPIRED',
    canTake: false,
    classroomSubjectId: 'cs-2',
  },
  {
    id: 2002,
    title: 'Lab — Normalization',
    duration: 40,
    totalQuestions: 25,
    maxScore: 10,
    startAt: '2026-08-18T10:00:00+07:00',
    endAt: '2026-08-18T11:00:00+07:00',
    examStatus: 'COMPLETED',
    myStatus: 'SUBMITTED',
    canTake: false,
    classroomSubjectId: 'cs-2',
  },
  {
    id: 2003,
    title: 'Quiz — Index & Transaction',
    duration: 25,
    totalQuestions: 18,
    maxScore: 10,
    startAt: '2026-09-05T15:00:00+07:00',
    endAt: '2026-09-05T15:40:00+07:00',
    examStatus: 'UPCOMING',
    myStatus: 'NOT_STARTED',
    canTake: false,
    classroomSubjectId: 'cs-2',
  },
  {
    id: 3001,
    title: 'Mini test — Search algorithms',
    duration: 35,
    totalQuestions: 22,
    maxScore: 10,
    startAt: '2026-08-26T09:00:00+07:00',
    endAt: '2026-08-26T10:00:00+07:00',
    examStatus: 'ONGOING',
    myStatus: 'NOT_STARTED',
    canTake: true,
    classroomSubjectId: 'cs-3',
  },
  {
    id: 3002,
    title: 'Đề đóng sớm — Neural nets',
    duration: 50,
    totalQuestions: 35,
    maxScore: 10,
    startAt: '2026-08-10T08:00:00+07:00',
    endAt: '2026-08-10T09:00:00+07:00',
    examStatus: 'CLOSED',
    myStatus: 'NOT_STARTED',
    canTake: false,
    classroomSubjectId: 'cs-3',
  },
]

export function formatStudentExamSchedule(startAt: string, endAt: string) {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const dateFmt = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const timeFmt = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${dateFmt.format(start)} · ${timeFmt.format(start)} – ${timeFmt.format(end)}`
}

export function getStudentTakeBlockReason(exam: StudentExamListItem): string | null {
  if (exam.canTake) return null
  if (exam.myStatus === 'SUBMITTED') return 'Bạn đã nộp bài'
  if (exam.myStatus === 'EXPIRED') return 'Đã hết thời gian làm bài'
  if (exam.examStatus === 'UPCOMING') return 'Chưa đến giờ mở đề'
  if (exam.examStatus === 'CLOSED') return 'Đề đã đóng'
  if (exam.examStatus === 'COMPLETED') return 'Kỳ thi đã kết thúc'
  return 'Không thể vào làm bài'
}
