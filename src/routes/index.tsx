import { createBrowserRouter } from 'react-router-dom'

import { AppWelcome } from '../components/common/AppWelcome'
import { RootLayout } from '../layouts/RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <AppWelcome />,
      },
    ],
  },
])
