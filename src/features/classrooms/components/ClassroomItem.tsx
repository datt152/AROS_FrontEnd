import { EyeOff, Pencil, Users } from 'lucide-react'

import { InactiveBadge } from '../../../components/common/InactiveBadge'
import { Button } from '../../../components/ui/Button'
import { ACTIVE_BADGE_CLASS } from '../../../constants/ui'
import { TableCell, TableRow } from '../../../components/ui/Table'
import type { ClassroomItem as ClassroomItemType } from '../types/classroom.types'

type ClassroomItemProps = {
  classroom: ClassroomItemType
  onEdit: (classroom: ClassroomItemType) => void
  onHide: (classroom: ClassroomItemType) => void
  onManageStudents: (classroom: ClassroomItemType) => void
}

const iconBtn =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border p-0 transition disabled:cursor-not-allowed disabled:opacity-50'

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (!isActive) return <InactiveBadge />
  return <span className={ACTIVE_BADGE_CLASS}>Đang hoạt động</span>
}

function ClassroomTableActions({
  classroom,
  onEdit,
  onHide,
  onManageStudents,
}: Pick<ClassroomItemProps, 'classroom' | 'onEdit' | 'onHide' | 'onManageStudents'>) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        title="Sinh viên"
        aria-label="Sinh viên"
        className={`${iconBtn} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
        onClick={() => onManageStudents(classroom)}
        disabled={!classroom.isActive}
      >
        <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title="Sửa"
        aria-label="Sửa"
        className={`${iconBtn} border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100`}
        onClick={() => onEdit(classroom)}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      {classroom.isActive ? (
        <button
          type="button"
          title="Ẩn"
          aria-label="Ẩn"
          className={`${iconBtn} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
          onClick={() => onHide(classroom)}
        >
          <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )
}

function ClassroomCardActions({
  classroom,
  onEdit,
  onHide,
  onManageStudents,
}: Pick<ClassroomItemProps, 'classroom' | 'onEdit' | 'onHide' | 'onManageStudents'>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        className="h-8 border border-blue-200 bg-blue-50 px-2.5 text-xs text-blue-700 hover:bg-blue-100 hover:text-blue-800"
        onClick={() => onManageStudents(classroom)}
        disabled={!classroom.isActive}
      >
        <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
        Sinh viên
      </Button>
      <Button
        variant="ghost"
        className="h-8 border border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-800 hover:bg-amber-100 hover:text-amber-900"
        onClick={() => onEdit(classroom)}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        Sửa
      </Button>
      {classroom.isActive ? (
        <Button
          variant="ghost"
          className="h-8 border border-red-200 bg-red-50 px-2.5 text-xs text-red-700 hover:bg-red-100 hover:text-red-800"
          onClick={() => onHide(classroom)}
        >
          <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
          Ẩn
        </Button>
      ) : null}
    </div>
  )
}

export function ClassroomItem({
  classroom,
  onEdit,
  onHide,
  onManageStudents,
}: ClassroomItemProps) {
  return (
    <article
      className={`grid grid-cols-1 items-center gap-3 px-4 py-3 ${classroom.isActive ? '' : 'bg-slate-50/80'}`}
    >
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tên lớp</p>
        <p className="font-medium text-slate-900" title={classroom.className}>
          {classroom.className}
        </p>
        {classroom.description ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500" title={classroom.description}>
            {classroom.description}
          </p>
        ) : null}
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Môn học</p>
        <p className="truncate text-sm text-slate-700" title={classroom.subjectName}>
          {classroom.subjectName}
        </p>
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Học kỳ</p>
        <p className="text-sm text-slate-700">{classroom.semester || '—'}</p>
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Năm học</p>
        <p className="text-sm text-slate-700">{classroom.academicYear || '—'}</p>
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</p>
        <StatusBadge isActive={classroom.isActive} />
      </div>

      <ClassroomCardActions
        classroom={classroom}
        onEdit={onEdit}
        onHide={onHide}
        onManageStudents={onManageStudents}
      />
    </article>
  )
}

export function ClassroomTableRow({
  classroom,
  onEdit,
  onHide,
  onManageStudents,
}: ClassroomItemProps) {
  return (
    <TableRow className={classroom.isActive ? '' : 'bg-slate-50/80'}>
      <TableCell className="max-w-0 overflow-hidden">
        <p className="truncate font-medium text-slate-900" title={classroom.className}>
          {classroom.className}
        </p>
        {classroom.description ? (
          <p className="mt-0.5 truncate text-xs text-slate-500" title={classroom.description}>
            {classroom.description}
          </p>
        ) : null}
      </TableCell>

      <TableCell className="max-w-0 overflow-hidden">
        <p className="truncate text-sm text-slate-700" title={classroom.subjectName}>
          {classroom.subjectName}
        </p>
      </TableCell>

      <TableCell className="whitespace-nowrap">
        <p className="truncate text-center text-sm text-slate-700">{classroom.semester || '—'}</p>
      </TableCell>

      <TableCell className="whitespace-nowrap">
        <p className="truncate text-center text-sm text-slate-700">{classroom.academicYear || '—'}</p>
      </TableCell>

      <TableCell className="whitespace-nowrap" align="center">
        <StatusBadge isActive={classroom.isActive} />
      </TableCell>

      <TableCell className="whitespace-nowrap" align="center">
        <ClassroomTableActions
          classroom={classroom}
          onEdit={onEdit}
          onHide={onHide}
          onManageStudents={onManageStudents}
        />
      </TableCell>
    </TableRow>
  )
}
