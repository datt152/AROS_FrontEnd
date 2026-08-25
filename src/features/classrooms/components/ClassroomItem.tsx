import { Pencil, Trash2, Users } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { TableCell, TableRow } from '../../../components/ui/Table'
import type { ClassroomItem as ClassroomItemType } from '../types/classroom.types'

type ClassroomItemProps = {
  classroom: ClassroomItemType
  onEdit: (classroom: ClassroomItemType) => void
  onDelete: (classroom: ClassroomItemType) => void
  onManageStudents: (classroom: ClassroomItemType) => void
}

function ClassroomActions({
  classroom,
  onEdit,
  onDelete,
  onManageStudents,
  spread = false,
}: Pick<ClassroomItemProps, 'classroom' | 'onEdit' | 'onDelete' | 'onManageStudents'> & {
  spread?: boolean
}) {
  return (
    <div className={`flex items-center ${spread ? 'w-full justify-evenly gap-1' : 'flex-wrap gap-2'}`}>
      <Button
        variant="ghost"
        className="h-8 border border-blue-200 bg-blue-50 px-2.5 text-xs text-blue-700 hover:bg-blue-100 hover:text-blue-800"
        onClick={() => onManageStudents(classroom)}
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
      <Button
        variant="ghost"
        className="h-8 border border-red-200 bg-red-50 px-2.5 text-xs text-red-700 hover:bg-red-100 hover:text-red-800"
        onClick={() => onDelete(classroom)}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        Xóa
      </Button>
    </div>
  )
}

export function ClassroomItem({
  classroom,
  onEdit,
  onDelete,
  onManageStudents,
}: ClassroomItemProps) {
  return (
    <article className="grid grid-cols-1 items-center gap-3 px-4 py-3">
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
        <span
          className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${
            classroom.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {classroom.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </span>
      </div>

      <ClassroomActions
        classroom={classroom}
        onEdit={onEdit}
        onDelete={onDelete}
        onManageStudents={onManageStudents}
      />
    </article>
  )
}

export function ClassroomTableRow({
  classroom,
  onEdit,
  onDelete,
  onManageStudents,
}: ClassroomItemProps) {
  return (
    <TableRow>
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
        <p className="truncate text-sm text-slate-700 text-center">{classroom.semester || '—'}</p>
      </TableCell>

      <TableCell className="whitespace-nowrap">
        <p className="truncate text-sm text-slate-700 text-center">{classroom.academicYear || '—'}</p>
      </TableCell>

      <TableCell className="whitespace-nowrap" align="center">
        <span
          className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${
            classroom.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {classroom.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </span>
      </TableCell>

      <TableCell className="whitespace-nowrap">
        <ClassroomActions
          classroom={classroom}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageStudents={onManageStudents}
          spread
        />
      </TableCell>
    </TableRow>
  )
}
