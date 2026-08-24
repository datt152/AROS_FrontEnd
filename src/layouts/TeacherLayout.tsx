import { Outlet } from 'react-router-dom'

export function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* TODO: mount Header / Sidebar / Footer for teacher */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white" data-role="Teacher" />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
