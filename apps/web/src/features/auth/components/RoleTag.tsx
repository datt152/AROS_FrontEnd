import { parseAppRole } from '../api/auth.api'
import { ROLE_LABEL, type Role } from '../../../routes/routes.config'

const roleTagClass: Record<Role, string> = {
  student: 'border-blue-200 bg-blue-50 text-blue-700',
  teacher: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

type RoleTagProps = {
  role: string
  className?: string
}

export function RoleTag({ role, className = '' }: RoleTagProps) {
  const appRole = parseAppRole(role)
  if (!appRole) {
    return (
      <span
        className={`inline-flex rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ${className}`}
      >
        {role || 'Không rõ'}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${roleTagClass[appRole]} ${className}`}
    >
      {ROLE_LABEL[appRole]}
    </span>
  )
}
