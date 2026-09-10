import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { TableCell, TableRow } from '../../../components/ui/Table'
import type { ExamTemplateItem as ExamTemplateItemType } from '../types/examTemplate.types'
import { formatTemplateDate } from '../types/examTemplate.types'

type ExamTemplateItemProps = {
  template: ExamTemplateItemType
  onEdit: (template: ExamTemplateItemType) => void
  onDelete: (template: ExamTemplateItemType) => void
}

const iconBtn =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border p-0 transition disabled:cursor-not-allowed disabled:opacity-50'

function TemplateTableActions({ template, onEdit, onDelete }: ExamTemplateItemProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        title="Sửa"
        aria-label="Sửa"
        className={`${iconBtn} border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100`}
        onClick={() => onEdit(template)}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title="Xóa"
        aria-label="Xóa"
        className={`${iconBtn} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
        onClick={() => onDelete(template)}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}

function TemplateCardActions({ template, onEdit, onDelete }: ExamTemplateItemProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        className="h-8 border border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-800 hover:bg-amber-100"
        onClick={() => onEdit(template)}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        Sửa
      </Button>
      <Button
        variant="ghost"
        className="h-8 border border-red-200 bg-red-50 px-2.5 text-xs text-red-700 hover:bg-red-100"
        onClick={() => onDelete(template)}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        Xóa
      </Button>
    </div>
  )
}

export function ExamTemplateCard({ template, onEdit, onDelete }: ExamTemplateItemProps) {
  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{template.title}</p>
        <p className="mt-0.5 text-sm text-slate-500">
          {template.subjectName ?? `Môn #${template.subjectId}`}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
        <p>{template.totalQuestions || template.questionIds.length} câu</p>
        <p>{formatTemplateDate(template.createdAt)}</p>
      </div>
      <TemplateCardActions template={template} onEdit={onEdit} onDelete={onDelete} />
    </article>
  )
}

export function ExamTemplateTableRow({ template, onEdit, onDelete }: ExamTemplateItemProps) {
  return (
    <TableRow>
      <TableCell>
        <p className="font-medium text-slate-900">{template.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {template.subjectName ?? `Môn #${template.subjectId}`}
        </p>
      </TableCell>
      <TableCell className="text-sm text-slate-600" align="center">
        {template.totalQuestions || template.questionIds.length}
      </TableCell>
      <TableCell className="text-sm text-slate-600" align="center">
        {formatTemplateDate(template.createdAt)}
      </TableCell>
      <TableCell align="center">
        <TemplateTableActions template={template} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}
