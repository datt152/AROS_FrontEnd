import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { INTERACTIVE_CARD_HOVER_CLASS } from '../../../constants/ui'
import { TableCell, TableRow } from '../../../components/ui/Table'
import type { QuestionItem as QuestionItemType } from '../types/question.types'
import { DIFFICULTY_BADGE_CLASS, DIFFICULTY_LABEL, QUESTION_TYPE_LABEL } from '../types/question.types'

type QuestionItemProps = {
  question: QuestionItemType
  onEdit: (question: QuestionItemType) => void
  onDelete: (question: QuestionItemType) => void
}

function QuestionActions({
  question,
  onEdit,
  onDelete,
  spread = false,
}: Pick<QuestionItemProps, 'question' | 'onEdit' | 'onDelete'> & { spread?: boolean }) {
  return (
    <div className={`flex items-center ${spread ? 'w-full justify-evenly gap-1' : 'flex-wrap gap-2'}`}>
      <Button
        variant="ghost"
        className="h-8 border border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-800 hover:bg-amber-100 hover:text-amber-900"
        onClick={() => onEdit(question)}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        Sửa
      </Button>
      <Button
        variant="ghost"
        className="h-8 border border-red-200 bg-red-50 px-2.5 text-xs text-red-700 hover:bg-red-100 hover:text-red-800"
        onClick={() => onDelete(question)}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        Xóa
      </Button>
    </div>
  )
}

function TypeBadge({ question }: { question: QuestionItemType }) {
  return (
    <span
      className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${
        question.type === 'SINGLE_CHOICE' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
      }`}
    >
      {QUESTION_TYPE_LABEL[question.type]}
    </span>
  )
}

function DifficultyBadge({ question }: { question: QuestionItemType }) {
  if (!question.difficulty) return <span className="text-sm text-slate-400">—</span>

  return (
    <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${DIFFICULTY_BADGE_CLASS[question.difficulty]}`}>
      {DIFFICULTY_LABEL[question.difficulty]}
    </span>
  )
}

export function QuestionItem({ question, onEdit, onDelete }: QuestionItemProps) {
  return (
    <article
      className={`grid grid-cols-1 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${INTERACTIVE_CARD_HOVER_CLASS}`}
    >
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Câu hỏi</p>
        <p className="line-clamp-2 text-sm font-medium text-slate-900" title={question.content}>
          {question.content}
        </p>
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Loại</p>
        <TypeBadge question={question} />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Độ khó</p>
        <DifficultyBadge question={question} />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Đáp án</p>
        <p className="text-sm text-slate-700">{question.options.length}</p>
      </div>
      <QuestionActions question={question} onEdit={onEdit} onDelete={onDelete} />
    </article>
  )
}

export function QuestionTableRow({ question, onEdit, onDelete }: QuestionItemProps) {
  return (
    <TableRow className="border-slate-200">
      <TableCell className="max-w-0 overflow-hidden py-3.5">
        <p className="line-clamp-2 text-sm font-medium text-slate-900" title={question.content}>
          {question.content}
        </p>
      </TableCell>
      <TableCell className="py-3.5" align='center'>
        <TypeBadge question={question} />
      </TableCell>
      <TableCell className="py-3.5" align='center'>
        <DifficultyBadge question={question} />
      </TableCell>
      <TableCell className="py-3.5" align='center'>{question.options.length}</TableCell>
      <TableCell className="whitespace-nowrap py-3.5 align-evenly">
        <QuestionActions question={question} onEdit={onEdit} onDelete={onDelete} spread />
      </TableCell>
    </TableRow>
  )
}
