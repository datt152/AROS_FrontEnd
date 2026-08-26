import { Eye, FileCode2, Lock, Pencil, Play, Trash2, Users } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { TableCell, TableRow } from '../../../components/ui/Table'
import type { ExamItem as ExamItemType } from '../types/exam.types'
import {
  EXAM_MODE_BADGE_CLASS,
  EXAM_MODE_LABEL,
  EXAM_STATUS_BADGE_CLASS,
  EXAM_STATUS_LABEL,
  canOpenExam,
  formatExamSchedule,
  getOpenExamBlockReason,
} from '../types/exam.types'

type ExamItemProps = {
  exam: ExamItemType
  onDetail: (exam: ExamItemType) => void
  onEdit: (exam: ExamItemType) => void
  onDelete: (exam: ExamItemType) => void
  onAssignClassrooms: (exam: ExamItemType) => void
  onGenerateVersions: (exam: ExamItemType) => void
  onOpenExam: (exam: ExamItemType) => void
  onCloseExam: (exam: ExamItemType) => void
}

function ModeBadge({ exam }: { exam: ExamItemType }) {
  return (
    <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${EXAM_MODE_BADGE_CLASS[exam.examMode]}`}>
      {EXAM_MODE_LABEL[exam.examMode]}
    </span>
  )
}

function StatusBadge({ exam }: { exam: ExamItemType }) {
  return (
    <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${EXAM_STATUS_BADGE_CLASS[exam.status]}`}>
      {EXAM_STATUS_LABEL[exam.status]}
    </span>
  )
}

function ExamActions({
  exam,
  onDetail,
  onEdit,
  onDelete,
  onAssignClassrooms,
  onGenerateVersions,
  onOpenExam,
  onCloseExam,
  spread = false,
}: ExamItemProps & { spread?: boolean }) {
  const isDraft = exam.status === 'DRAFT'
  const isOngoing = exam.status === 'ONGOING' || exam.status === 'UPCOMING'
  const canDelete = !exam.hasSubmissions && (isDraft || exam.status === 'CLOSED')
  const openReady = canOpenExam(exam).ready
  const openBlockReason = getOpenExamBlockReason(exam)

  return (
    <div className={`flex items-center ${spread ? 'w-full flex-wrap justify-evenly gap-1' : 'flex-wrap gap-2'}`}>
      <Button
        variant="ghost"
        className="h-8 border border-blue-200 bg-blue-50 px-2 text-xs text-blue-700 hover:bg-blue-100"
        onClick={() => onDetail(exam)}
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
        Chi tiết
      </Button>

      {isDraft ? (
        <>
          <Button
            variant="ghost"
            className="h-8 border border-amber-200 bg-amber-50 px-2 text-xs text-amber-800 hover:bg-amber-100"
            onClick={() => onEdit(exam)}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Sửa
          </Button>
          <span title={openBlockReason ?? undefined}>
            <Button
              variant="ghost"
              className="h-8 border border-emerald-200 bg-emerald-50 px-2 text-xs text-emerald-700 hover:bg-emerald-100"
              disabled={!openReady}
              onClick={() => onOpenExam(exam)}
            >
              <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
              Mở thi
            </Button>
          </span>
        </>
      ) : null}

      {isOngoing ? (
        <Button
          variant="ghost"
          className="h-8 border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 hover:bg-slate-100"
          onClick={() => onCloseExam(exam)}
        >
          <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
          Đóng thi
        </Button>
      ) : null}

      <span title={exam.hasSubmissions ? 'Không thể xóa đề đã có bài nộp' : undefined}>
        <Button
          variant="ghost"
          className="h-8 border border-red-200 bg-red-50 px-2 text-xs text-red-700 hover:bg-red-100"
          disabled={!canDelete}
          onClick={() => onDelete(exam)}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Xóa
        </Button>
      </span>
    </div>
  )
}

export function ExamItem(props: ExamItemProps) {
  const { exam } = props

  return (
    <article className="grid grid-cols-1 items-start gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tiêu đề</p>
        <p className="font-medium text-slate-900">{exam.title}</p>
        {exam.sourceTemplateId ? (
          <span className="mt-1 inline-flex rounded-lg bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
            Từ thư viện
          </span>
        ) : null}
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</p>
        <StatusBadge exam={exam} />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Môn học</p>
        <p className="text-sm text-slate-700">{exam.subjectName ?? `Môn #${exam.subjectId}`}</p>
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hình thức</p>
        <ModeBadge exam={exam} />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lịch</p>
        <p className="text-sm text-slate-700">{formatExamSchedule(exam.startAt, exam.endAt)}</p>
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Số lớp</p>
        <p className="text-sm text-slate-700">{exam.classroomIds?.length ?? 0}</p>
      </div>
      <ExamActions {...props} />
    </article>
  )
}

export function ExamTableRow(props: ExamItemProps) {
  const { exam } = props

  return (
    <TableRow className="border-slate-200">
      <TableCell className="max-w-0 overflow-hidden py-3.5">
        <p className="truncate font-medium text-slate-900" title={exam.title}>
          {exam.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {exam.duration} phút · {exam.totalQuestions} câu · {exam.maxScore} điểm
          {exam.sourceTemplateId ? ' · Từ thư viện' : ''}
        </p>
      </TableCell>
      <TableCell className="py-3.5" align="center">
        <StatusBadge exam={exam} />
      </TableCell>
      <TableCell className="max-w-0 overflow-hidden py-3.5">
        <p className="truncate text-sm text-slate-700">{exam.subjectName ?? `Môn #${exam.subjectId}`}</p>
      </TableCell>
      <TableCell className="py-3.5" align="center">
        <ModeBadge exam={exam} />
      </TableCell>
      <TableCell className="py-3.5 text-xs text-slate-600" align="center">
        {formatExamSchedule(exam.startAt, exam.endAt)}
      </TableCell>
      <TableCell className="py-3.5" align="center">
        {exam.classroomIds?.length ?? 0}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5">
        <ExamActions {...props} spread />
      </TableCell>
    </TableRow>
  )
}
