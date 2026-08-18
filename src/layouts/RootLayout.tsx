import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <main className="app-shell">
      <Outlet />
    </main>
  )
}
