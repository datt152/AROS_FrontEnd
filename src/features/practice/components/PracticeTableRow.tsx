import { Eye, Lock, Pencil, Trash2 } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
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

function PracticeActions({ item, onDetail, onEdit, onDelete, onClose }: PracticeTableRowProps) {
  const isDraft = item.status === 'DRAFT'
  const isOpen = item.status === 'ONGOING' || item.status === 'UPCOMING'

  return (
    <div className="flex flex-wrap items-center justify-evenly gap-1">
      <Button
        variant="ghost"
        className="h-8 border border-blue-200 bg-blue-50 px-2 text-xs text-blue-700 hover:bg-blue-100"
        onClick={() => onDetail(item)}
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
        Chi tiết
      </Button>

      {isDraft ? (
        <Button
          variant="ghost"
          className="h-8 border border-amber-200 bg-amber-50 px-2 text-xs text-amber-800 hover:bg-amber-100"
          onClick={() => onEdit(item)}
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          Sửa
        </Button>
      ) : null}

      {isOpen ? (
        <Button
          variant="ghost"
          className="h-8 border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 hover:bg-slate-100"
          onClick={() => onClose(item)}
        >
          <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
          Đóng
        </Button>
      ) : null}

      <Button
        variant="ghost"
        className="h-8 border border-red-200 bg-red-50 px-2 text-xs text-red-700 hover:bg-red-100"
        disabled={!isDraft}
        title={!isDraft ? 'Chỉ xoá được bài ở trạng thái Nháp' : undefined}
        onClick={() => onDelete(item)}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        Xóa
      </Button>
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
      <TableCell className="whitespace-nowrap py-3.5">
        <PracticeActions {...props} />
      </TableCell>
    </TableRow>
  )
}
