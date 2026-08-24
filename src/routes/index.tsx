import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { SubjectListPage } from '../features/subjects/pages/SubjectListPage'
import { AuthLayout } from '../layouts/AuthLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { TeacherLayout } from '../layouts/TeacherLayout'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { ROUTES, STUDENT_PATHS, TEACHER_PATHS } from './routes.config'

function teacherPageForPath(path: string) {
  if (path === ROUTES.teacher.subjects) return <SubjectListPage />
  return null
}

export const router = createBrowserRouter([
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
              element: null,
            })),
          },
        ],
      },
    ],
  },
  { path: ROUTES.unauthorized, element: <UnauthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
