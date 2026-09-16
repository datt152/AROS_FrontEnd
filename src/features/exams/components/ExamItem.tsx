import { Eye, Lock, Pencil, Trash2 } from 'lucide-react'

import { TableCell, TableRow } from '../../../components/ui/Table'
import type { ExamItem as ExamItemType } from '../types/exam.types'
import {
  EXAM_MODE_BADGE_CLASS,
  EXAM_MODE_LABEL,
  EXAM_STATUS_BADGE_CLASS,
  EXAM_STATUS_LABEL,
  formatExamDateOnly,
  formatExamSchedule,
} from '../types/exam.types'

type ExamItemProps = {
  exam: ExamItemType
  /** OMR list: title, mode, subject, examDate, classroom count only */
  compactOmr?: boolean
  onDetail: (exam: ExamItemType) => void
  onEdit: (exam: ExamItemType) => void
  onDelete: (exam: ExamItemType) => void
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
  onCloseExam,
}: ExamItemProps) {
  const isDraft = exam.status === 'DRAFT'
  const isOngoing = exam.status === 'ONGOING' || exam.status === 'UPCOMING'
  const canDelete = !exam.hasSubmissions && (isDraft || exam.status === 'CLOSED')
  const deleteTitle = exam.hasSubmissions
    ? 'Không thể xóa đề đã có bài nộp'
    : !canDelete
      ? 'Không thể xóa đề ở trạng thái này'
      : 'Xóa'

  const iconBtn =
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border p-0 transition disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        title="Chi tiết"
        aria-label="Chi tiết"
        className={`${iconBtn} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
        onClick={() => onDetail(exam)}
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      {isDraft ? (
        <button
          type="button"
          title="Sửa"
          aria-label="Sửa"
          className={`${iconBtn} border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100`}
          onClick={() => onEdit(exam)}
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      ) : null}

      <button
        type="button"
        title={deleteTitle}
        aria-label={deleteTitle}
        disabled={!canDelete}
        className={`${iconBtn} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
        onClick={() => onDelete(exam)}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      {isOngoing && exam.examMode === 'ONLINE' ? (
        <button
          type="button"
          title="Đóng thi"
          aria-label="Đóng thi"
          className={`${iconBtn} border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100`}
          onClick={() => onCloseExam(exam)}
        >
          <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )
}

function examDateLabel(exam: ExamItemType) {
  return formatExamDateOnly(exam.paperSettings?.examDate)
}

export function ExamItem(props: ExamItemProps) {
  const { exam, compactOmr } = props

  if (compactOmr) {
    return (
      <article className="grid grid-cols-1 items-start gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tiêu đề</p>
          <p className="font-medium text-slate-900">{exam.title}</p>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hình thức</p>
          <ModeBadge exam={exam} />
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Môn học</p>
          <p className="text-sm text-slate-700">{exam.subjectName ?? `Môn #${exam.subjectId}`}</p>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ngày thi</p>
          <p className="text-sm text-slate-700">{examDateLabel(exam)}</p>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Số lớp</p>
          <p className="text-sm text-slate-700">{exam.classroomIds?.length ?? 0}</p>
        </div>
        <ExamActions {...props} />
      </article>
    )
  }

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
  const { exam, compactOmr } = props

  if (compactOmr) {
    return (
      <TableRow className="border-slate-200">
        <TableCell className="max-w-0 overflow-hidden py-3.5">
          <p className="truncate font-medium text-slate-900" title={exam.title}>
            {exam.title}
          </p>
        </TableCell>
        <TableCell className="py-3.5" align="center">
          <ModeBadge exam={exam} />
        </TableCell>
        <TableCell className="max-w-0 overflow-hidden py-3.5">
          <p className="truncate text-sm text-slate-700">{exam.subjectName ?? `Môn #${exam.subjectId}`}</p>
        </TableCell>
        <TableCell className="py-3.5 text-sm text-slate-700" align="center">
          {examDateLabel(exam)}
        </TableCell>
        <TableCell className="py-3.5" align="center">
          {exam.classroomIds?.length ?? 0}
        </TableCell>
        <TableCell className="whitespace-nowrap py-3.5" align="center">
          <ExamActions {...props} />
        </TableCell>
      </TableRow>
    )
  }

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
      <TableCell className="whitespace-nowrap py-3.5" align="center">
        <ExamActions {...props} />
      </TableCell>
    </TableRow>
  )
}
