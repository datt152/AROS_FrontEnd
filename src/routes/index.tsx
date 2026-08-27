import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AuthSessionBridge } from '../features/auth/components/AuthSessionBridge'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { ClassroomListPage } from '../features/classrooms/pages/ClassroomListPage'
import { ExamTemplateListPage } from '../features/exam-templates/pages/ExamTemplateListPage'
import { ExamListPage } from '../features/exams/pages/ExamListPage'
import { ExamTakePage } from '../features/exams/pages/ExamTakePage'
import { StudentExamListPage } from '../features/exams/pages/StudentExamListPage'
import { QuestionListPage } from '../features/questions/pages/QuestionListPage'
import { SubjectListPage } from '../features/subjects/pages/SubjectListPage'
import { AuthLayout } from '../layouts/AuthLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { TeacherLayout } from '../layouts/TeacherLayout'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { ExamStatsPage } from '../features/exam-stats/pages/ExamStatsPage'
import { GradingPage } from '../features/grading/pages/GradingPage'
import { PracticeListPage } from '../features/practice/pages/PracticeListPage'
import { PracticeTakePage } from '../features/practice/pages/PracticeTakePage'
import { StudentPracticeListPage } from '../features/practice/pages/StudentPracticeListPage'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { ROUTES, STUDENT_PATHS, TEACHER_PATHS } from './routes.config'

function teacherPageForPath(path: string) {
  if (path === ROUTES.teacher.subjects) return <SubjectListPage />
  if (path === ROUTES.teacher.classrooms) return <ClassroomListPage />
  if (path === ROUTES.teacher.questionBank) return <QuestionListPage />
  if (path === ROUTES.teacher.exams) return <ExamListPage />
  if (path === ROUTES.teacher.examTemplates) return <ExamTemplateListPage />
  if (path === ROUTES.teacher.grading) return <GradingPage />
  if (path === ROUTES.teacher.examStats) return <ExamStatsPage />
  if (path === ROUTES.teacher.practice) return <PracticeListPage />
  if (path === ROUTES.teacher.createPractice) return <PracticeListPage />
  return null
}

function studentPageForPath(path: string) {
  if (path === ROUTES.student.exams) return <StudentExamListPage />
  if (path === ROUTES.student.takeExam) return <ExamTakePage />
  if (path === ROUTES.student.practice) return <StudentPracticeListPage />
  if (path === ROUTES.student.takePractice) return <PracticeTakePage />
  return null
}

export const router = createBrowserRouter([
  {
    element: <AuthSessionBridge />,
    children: [
      {
        element: <PublicLayout />,
        children: [{ path: ROUTES.home, element: <HomePage /> }],
      },
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: ROUTES.login, element: <LoginPage /> },
              { path: ROUTES.register, element: <RegisterPage /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <RoleRoute allowedRoles={['teacher']} />,
            children: [
              {
                element: <TeacherLayout />,
                children: TEACHER_PATHS.map((path) => ({
                  path,
                  element: teacherPageForPath(path),
                })),
              },
            ],
          },
          {
            element: <RoleRoute allowedRoles={['student']} />,
            children: [
              {
                element: <StudentLayout />,
                children: STUDENT_PATHS.map((path) => ({
                  path,
                  element: studentPageForPath(path),
                })),
              },
            ],
          },
        ],
      },
      { path: ROUTES.unauthorized, element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
