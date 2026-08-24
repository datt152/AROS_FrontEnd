import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import type { SubjectItem as SubjectItemType } from '../types/subject.types'

type SubjectItemProps = {
  subject: SubjectItemType
  onEdit: (subject: SubjectItemType) => void
  onDelete: (subject: SubjectItemType) => void
}

export function SubjectItem({ subject, onEdit, onDelete }: SubjectItemProps) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 px-4 py-3 hover:bg-slate-50/70 md:grid-cols-[minmax(12rem,1fr)_minmax(0,2fr)_auto] md:gap-4">
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">
          Subject name
        </p>
        <p className="font-medium text-slate-900 md:truncate" title={subject.subjectName}>
          {subject.subjectName}
        </p>
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">
          Description
        </p>
        <p className="line-clamp-2 text-sm leading-5 text-slate-600" title={subject.description}>
          {subject.description}
        </p>
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        <Button variant="secondary" className="h-9 flex-1 px-3 md:flex-none" onClick={() => onEdit(subject)}>
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          Edit
        </Button>
        <Button
          variant="ghost"
          className="h-9 flex-1 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 md:flex-none"
          onClick={() => onDelete(subject)}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Delete
        </Button>
      </div>
    </div>
  )
}
