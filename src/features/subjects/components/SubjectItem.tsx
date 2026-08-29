import { EyeOff, Pencil } from 'lucide-react'

import { InactiveBadge } from '../../../components/common/InactiveBadge'
import { Button } from '../../../components/ui/Button'
import { ACTIVE_BADGE_CLASS } from '../../../constants/ui'
import { TableCell, TableRow } from '../../../components/ui/Table'
import type { SubjectItem as SubjectItemType } from '../types/subject.types'

type SubjectItemProps = {
  subject: SubjectItemType
  onEdit: (subject: SubjectItemType) => void
  onHide: (subject: SubjectItemType) => void
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (!isActive) return <InactiveBadge />
  return <span className={ACTIVE_BADGE_CLASS}>Đang hiển thị</span>
}

function SubjectActions({
  subject,
  onEdit,
  onHide,
  spread = false,
}: Pick<SubjectItemProps, 'subject' | 'onEdit' | 'onHide'> & { spread?: boolean }) {
  return (
    <div className={`flex items-center ${spread ? 'w-full justify-evenly gap-1' : 'gap-2'}`}>
      <Button
        variant="ghost"
        className="h-8 border border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-800 hover:bg-amber-100 hover:text-amber-900"
        onClick={() => onEdit(subject)}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        Sửa
      </Button>
      {subject.isActive ? (
        <Button
          variant="ghost"
          className="h-8 border border-red-200 bg-red-50 px-2.5 text-xs text-red-700 hover:bg-red-100 hover:text-red-800"
          onClick={() => onHide(subject)}
        >
          <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
          Ẩn
        </Button>
      ) : null}
    </div>
  )
}

export function SubjectItem({ subject, onEdit, onHide }: SubjectItemProps) {
  return (
    <article className={`grid grid-cols-1 items-center gap-3 px-4 py-3 ${subject.isActive ? '' : 'bg-slate-50/80'}`}>
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tên môn học</p>
        <p className="font-medium text-slate-900" title={subject.subjectName}>
          {subject.subjectName}
        </p>
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Mô tả</p>
        <p className="line-clamp-2 text-sm leading-5 text-slate-600" title={subject.description}>
          {subject.description}
        </p>
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</p>
        <StatusBadge isActive={subject.isActive} />
      </div>

      <SubjectActions subject={subject} onEdit={onEdit} onHide={onHide} />
    </article>
  )
}

export function SubjectTableRow({ subject, onEdit, onHide }: SubjectItemProps) {
  return (
    <TableRow className={subject.isActive ? '' : 'bg-slate-50/80'}>
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
        <StatusBadge isActive={subject.isActive} />
      </TableCell>

      <TableCell className="whitespace-nowrap">
        <SubjectActions subject={subject} onEdit={onEdit} onHide={onHide} spread />
      </TableCell>
    </TableRow>
  )
}
