import { Eye } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { TableCell, TableRow } from '../../../components/ui/Table'
import type { GradingStudentRow } from '../types/grading.types'
import { canViewSubmission, formatGradingDateTime, formatScoreDisplay } from '../types/grading.types'
import { GradingStatusBadge } from './GradingStatusBadge'

type GradingStudentRowProps = {
  index: number
  student: GradingStudentRow
  maxScore: number
  onViewSubmission: (student: GradingStudentRow) => void
}

export function GradingStudentTableRow({ index, student, maxScore, onViewSubmission }: GradingStudentRowProps) {
  const canView = canViewSubmission(student)

  return (
    <TableRow>
      <TableCell align="center" className="tabular-nums text-slate-500">
        {index + 1}
      </TableCell>
      <TableCell className="font-medium text-slate-900">{student.studentCode}</TableCell>
      <TableCell className="font-medium text-slate-900">{student.fullName}</TableCell>
      <TableCell className="truncate text-slate-600">{student.email}</TableCell>
      <TableCell align="center">
        <GradingStatusBadge status={student.status} />
      </TableCell>
      <TableCell align="center" className="tabular-nums text-slate-700">
        {student.versionCode ?? '—'}
      </TableCell>
      <TableCell align="center" className="font-medium tabular-nums text-slate-900">
        {formatScoreDisplay(student.score, maxScore, student.status)}
      </TableCell>
      <TableCell align="center" className="whitespace-nowrap text-slate-600">
        {formatGradingDateTime(student.submitTime)}
      </TableCell>
      <TableCell align="center">
        <Button
          variant="secondary"
          className="h-8 px-2.5 text-xs"
          disabled={!canView}
          title={canView ? 'Xem bài đã nộp' : 'Chỉ xem được bài đã nộp'}
          onClick={() => onViewSubmission(student)}
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
          Xem bài
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function GradingStudentCard({ index, student, maxScore, onViewSubmission }: GradingStudentRowProps) {
  const canView = canViewSubmission(student)

  return (
    <article className="space-y-3 border-b border-slate-200 px-4 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">#{index + 1}</p>
          <h3 className="mt-0.5 truncate text-sm font-semibold text-slate-900">{student.fullName}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {student.studentCode} · {student.email}
          </p>
        </div>
        <GradingStatusBadge status={student.status} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
        <div>
          <p className="text-slate-400">Mã đề</p>
          <p className="mt-0.5 font-medium text-slate-800">{student.versionCode ?? '—'}</p>
        </div>
        <div>
          <p className="text-slate-400">Điểm</p>
          <p className="mt-0.5 font-medium text-slate-800">
            {formatScoreDisplay(student.score, maxScore, student.status)}
          </p>
        </div>
        <div>
          <p className="text-slate-400">Nộp lúc</p>
          <p className="mt-0.5 font-medium text-slate-800">{formatGradingDateTime(student.submitTime)}</p>
        </div>
      </div>
      <Button
        variant="secondary"
        className="h-9 w-full text-xs"
        disabled={!canView}
        onClick={() => onViewSubmission(student)}
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
        Xem bài
      </Button>
    </article>
  )
}
