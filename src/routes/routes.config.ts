export type Role = 'teacher' | 'student'

export const ROLE_LABEL: Record<Role, string> = {
  teacher: 'Giáo viên',
  student: 'Sinh viên',
}

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  unauthorized: '/unauthorized',

  student: {
    dashboard: '/student/dashboard',
    exams: '/student/exams',
    examBySubject: '/student/exams/:subjectId',
    examResult: '/student/exam-result',
    takeExam: '/student/take-exam',
    history: '/student/history',
    historyDetail: '/student/history/:submissionId',
    practice: '/student/practice',
    examDetail: '/student/exam-detail/:id',
    practiceBySubject: '/student/practice/:subjectId',
    takePractice: '/student/practice/take',
    practiceResult: '/student/practice-result',
  },

  teacher: {
    dashboard: '/teacher/dashboard',
    subjects: '/teacher/subjects',
    classrooms: '/teacher/classrooms',
    exams: '/teacher/exams',
    examTemplates: '/teacher/exam-templates',
    grading: '/teacher/grading',
    questionBank: '/teacher/question-bank',
    omrUpload: '/teacher/omr-upload',
    omrSessions: '/teacher/omr/exams/:examId/sessions',
    omrSession: '/teacher/omr/sessions/:sessionId',
    omrSheet: '/teacher/omr/sheets/:sheetId',
    practice: '/teacher/practice',
    createPractice: '/teacher/practice/create',
    examStats: '/teacher/exam-stats',
  },
} as const

export type NavItem = {
  path: string
  label: string
}

export const MENU_BY_ROLE: Record<Role, NavItem[]> = {
  student: [
    { path: ROUTES.student.dashboard, label: 'Bảng điều khiển' },
    { path: ROUTES.student.exams, label: 'Bài thi' },
    { path: ROUTES.student.practice, label: 'Luyện tập' },
    { path: ROUTES.student.history, label: 'Lịch sử' },
  ],
  teacher: [
    { path: ROUTES.teacher.dashboard, label: 'Bảng điều khiển' },
    { path: ROUTES.teacher.subjects, label: 'Môn học' },
    { path: ROUTES.teacher.classrooms, label: 'Lớp học' },
    { path: ROUTES.teacher.questionBank, label: 'Ngân hàng câu hỏi' },
    { path: ROUTES.teacher.examTemplates, label: 'Thư viện đề' },
    { path: ROUTES.teacher.exams, label: 'Quản lý bài thi' },
    { path: ROUTES.teacher.practice, label: 'Bài luyện tập' },
    { path: ROUTES.teacher.grading, label: 'Chấm điểm' },
    { path: ROUTES.teacher.omrUpload, label: 'Tải lên OMR' },
    { path: ROUTES.teacher.examStats, label: 'Thống kê bài thi' },
  ],
}

export const STUDENT_PATHS = Object.values(ROUTES.student)
export const TEACHER_PATHS = Object.values(ROUTES.teacher)

export function getHomePathForRole(role: Role) {
  return role === 'teacher' ? ROUTES.teacher.dashboard : ROUTES.student.dashboard
}

export function studentHistoryDetailPath(submissionId: number) {
  return `/student/history/${submissionId}`
}

export function omrSessionsPath(examId: number, classroomId?: number) {
  const base = `/teacher/omr/exams/${examId}/sessions`
  return classroomId ? `${base}?classroomId=${classroomId}` : base
}

export function omrSessionPath(sessionId: number) {
  return `/teacher/omr/sessions/${sessionId}`
}

export function omrSheetPath(sheetId: number) {
  return `/teacher/omr/sheets/${sheetId}`
}
