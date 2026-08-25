import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { TableCell, TableRow } from '../../../components/ui/Table'
import type { SubjectItem as SubjectItemType } from '../types/subject.types'

type SubjectItemProps = {
  subject: SubjectItemType
  onEdit: (subject: SubjectItemType) => void
  onDelete: (subject: SubjectItemType) => void
}

function SubjectActions({
  subject,
  onEdit,
  onDelete,
  spread = false,
}: Pick<SubjectItemProps, 'subject' | 'onEdit' | 'onDelete'> & { spread?: boolean }) {
  return (
    <div className={`flex items-center ${spread ? 'w-full justify-between gap-1' : 'gap-2'}`}>
      <Button
        variant="ghost"
        className="h-8 border border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-800 hover:bg-amber-100 hover:text-amber-900"
        onClick={() => onEdit(subject)}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        Edit
      </Button>
      <Button
        variant="ghost"
        className="h-8 border border-red-200 bg-red-50 px-2.5 text-xs text-red-700 hover:bg-red-100 hover:text-red-800"
        onClick={() => onDelete(subject)}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        Delete
      </Button>
    </div>
  )
}

export function SubjectItem({ subject, onEdit, onDelete }: SubjectItemProps) {
  return (
    <article className="grid grid-cols-1 items-center gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Subject name</p>
        <p className="font-medium text-slate-900" title={subject.subjectName}>
          {subject.subjectName}
        </p>
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Description</p>
        <p className="line-clamp-2 text-sm leading-5 text-slate-600" title={subject.description}>
          {subject.description}
        </p>
      </div>

      <SubjectActions subject={subject} onEdit={onEdit} onDelete={onDelete} />
    </article>
  )
}

export function SubjectTableRow({ subject, onEdit, onDelete }: SubjectItemProps) {
  return (
    <TableRow>
      <TableCell className="max-w-0 overflow-hidden">
        <p className="truncate font-medium text-slate-900" title={subject.subjectName}>
          {subject.subjectName}
        </p>
      </TableCell>

      <TableCell className="max-w-0 overflow-hidden">
        <p className="line-clamp-2 text-sm leading-5 text-slate-600" title={subject.description}>
          {subject.description}
        </p>
      </TableCell>

      <TableCell className="whitespace-nowrap">
        <SubjectActions subject={subject} onEdit={onEdit} onDelete={onDelete} spread />
      </TableCell>
    </TableRow>
  )
}
