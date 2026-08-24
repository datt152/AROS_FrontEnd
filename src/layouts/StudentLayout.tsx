import { Outlet } from 'react-router-dom'

export function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* TODO: mount Header / Sidebar / Footer for student */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white" data-role="Student" />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
