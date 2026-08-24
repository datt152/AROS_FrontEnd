import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AuthLayout } from '../layouts/AuthLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { TeacherLayout } from '../layouts/TeacherLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { ROUTES, STUDENT_PATHS, TEACHER_PATHS } from './routes.config'

// TODO: replace null placeholders with page components when features land
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.home, element: null },
      { path: ROUTES.login, element: null },
      { path: ROUTES.unauthorized, element: null },
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
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
