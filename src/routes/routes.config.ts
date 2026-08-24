export type Role = 'teacher' | 'student'

export const ROLE_LABEL: Record<Role, string> = {
  teacher: 'Teacher',
  student: 'Student',
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
    takeExam: '/student/take-exam/:examId',
    history: '/student/history',
    practice: '/student/practice',
    examDetail: '/student/exam-detail/:id',
    practiceBySubject: '/student/practice/:subjectId',
    takePractice: '/student/practice/take/:practiceId',
    practiceResult: '/student/practice-result',
  },

  teacher: {
    dashboard: '/teacher/dashboard',
    createExam: '/teacher/exams/create',
    grading: '/teacher/grading',
    questionBank: '/teacher/question-bank',
    omrUpload: '/teacher/omr-upload',
    createPractice: '/teacher/practice/create',
    examStats: '/teacher/exam-stats',
    history: '/teacher/history',
  },
} as const

export type NavItem = {
  path: string
  label: string
}

export const MENU_BY_ROLE: Record<Role, NavItem[]> = {
  student: [
    { path: ROUTES.student.dashboard, label: 'Dashboard' },
    { path: ROUTES.student.exams, label: 'Exams' },
    { path: ROUTES.student.practice, label: 'Practice' },
    { path: ROUTES.student.history, label: 'History' },
  ],
  teacher: [
    { path: ROUTES.teacher.dashboard, label: 'Dashboard' },
    { path: ROUTES.teacher.createExam, label: 'Create Exam' },
    { path: ROUTES.teacher.grading, label: 'Grading' },
    { path: ROUTES.teacher.questionBank, label: 'Question Bank' },
    { path: ROUTES.teacher.omrUpload, label: 'OMR Upload' },
    { path: ROUTES.teacher.createPractice, label: 'Create Practice' },
    { path: ROUTES.teacher.examStats, label: 'Exam Stats' },
    { path: ROUTES.teacher.history, label: 'History' },
  ],
}

export const STUDENT_PATHS = Object.values(ROUTES.student)
export const TEACHER_PATHS = Object.values(ROUTES.teacher)

export function getHomePathForRole(role: Role) {
  return role === 'teacher' ? ROUTES.teacher.dashboard : ROUTES.student.dashboard
}
