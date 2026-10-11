import { Eye, Lock, Pencil, Trash2 } from 'lucide-react'

import { TableCell, TableRow } from '../../../components/ui/Table'
import type { PracticeItem } from '../types/practice.types'
import { formatMaxAttempts, formatTimeLimit } from '../types/practice.types'
import { PracticeStatusBadge } from './PracticeStatusBadge'

type PracticeTableRowProps = {
  item: PracticeItem
  onDetail: (item: PracticeItem) => void
  onEdit: (item: PracticeItem) => void
  onDelete: (item: PracticeItem) => void
  onClose: (item: PracticeItem) => void
}

const iconBtn =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border p-0 transition disabled:cursor-not-allowed disabled:opacity-50'

function PracticeActions({ item, onDetail, onEdit, onDelete, onClose }: PracticeTableRowProps) {
  const isDraft = item.status === 'DRAFT'
  const isOpen = item.status === 'ONGOING' || item.status === 'UPCOMING'
  const deleteTitle = !isDraft ? 'Chỉ xoá được bài ở trạng thái Nháp' : 'Xóa'

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        title="Chi tiết"
        aria-label="Chi tiết"
        className={`${iconBtn} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
        onClick={() => onDetail(item)}
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      {isDraft ? (
        <button
          type="button"
          title="Sửa"
          aria-label="Sửa"
          className={`${iconBtn} border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100`}
          onClick={() => onEdit(item)}
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      ) : null}

      <button
        type="button"
        title={deleteTitle}
        aria-label={deleteTitle}
        disabled={!isDraft}
        className={`${iconBtn} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
        onClick={() => onDelete(item)}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      {isOpen ? (
        <button
          type="button"
          title="Đóng"
          aria-label="Đóng"
          className={`${iconBtn} border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100`}
          onClick={() => onClose(item)}
        >
          <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )
}

export function PracticeTableRow(props: PracticeTableRowProps) {
  const { item } = props

  return (
    <TableRow className="border-slate-200">
      <TableCell className="max-w-0 overflow-hidden py-3.5">
        <p className="truncate font-medium text-slate-900" title={item.title}>
          {item.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {item.config.timeLimitEnabled ? `${item.duration} phút` : 'Không giới hạn giờ'} ·{' '}
          {item.totalQuestions} câu · {item.maxScore} điểm
        </p>
      </TableCell>
      <TableCell className="py-3.5" align="center">
        <PracticeStatusBadge status={item.status} />
      </TableCell>
      <TableCell className="max-w-0 overflow-hidden py-3.5">
        <p className="truncate text-sm text-slate-700">{item.subjectName}</p>
      </TableCell>
      <TableCell className="py-3.5 text-sm text-slate-700" align="center">
        {formatMaxAttempts(item.config.maxAttempts)}
      </TableCell>
      <TableCell className="py-3.5 text-sm text-slate-700" align="center">
        {formatTimeLimit(item.config.timeLimitEnabled, item.duration)}
      </TableCell>
      <TableCell className="py-3.5" align="center">
        {item.classroomIds.length}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5" align="center">
        <PracticeActions {...props} />
      </TableCell>
    </TableRow>
  )
}
