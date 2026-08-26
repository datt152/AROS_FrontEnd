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

function TemplateActions({ template, onEdit, onDelete }: ExamTemplateItemProps) {
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
      <TemplateActions template={template} onEdit={onEdit} onDelete={onDelete} />
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
      <TableCell className="text-sm text-slate-600">
        {template.totalQuestions || template.questionIds.length}
      </TableCell>
      <TableCell className="text-sm text-slate-600">{formatTemplateDate(template.createdAt)}</TableCell>
      <TableCell>
        <TemplateActions template={template} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}
