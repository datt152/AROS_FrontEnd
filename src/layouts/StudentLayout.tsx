import { Outlet } from 'react-router-dom'

import { AppFooter } from '../components/common/AppFooter'

export function StudentLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="flex min-h-0 flex-1">
        {/* TODO: mount Header / Sidebar for student */}
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white" data-role="Student" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <AppFooter />
    </div>
  )
}
