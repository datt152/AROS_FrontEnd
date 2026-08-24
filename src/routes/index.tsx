import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AuthLayout } from '../layouts/AuthLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { TeacherLayout } from '../layouts/TeacherLayout'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { ROUTES, STUDENT_PATHS, TEACHER_PATHS } from './routes.config'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
// TODO: replace null placeholders with page components when features land
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      
    ],
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
              element: null,
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
  { path: '*', element: <NotFoundPage /> },
  { path: ROUTES.unauthorized, element: <UnauthorizedPage /> }
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
