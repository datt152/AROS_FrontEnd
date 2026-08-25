import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { TableCell, TableRow } from '../../../components/ui/Table'
import type { QuestionItem as QuestionItemType } from '../types/question.types'
import { DIFFICULTY_BADGE_CLASS, DIFFICULTY_LABEL, QUESTION_TYPE_LABEL } from '../types/question.types'

type QuestionItemProps = {
  question: QuestionItemType
  onEdit: (question: QuestionItemType) => void
}

function QuestionActions({ question, onEdit, spread = false }: Pick<QuestionItemProps, 'question' | 'onEdit'> & { spread?: boolean }) {
  return (
    <div className={`flex items-center ${spread ? 'w-full justify-between gap-1' : 'flex-wrap gap-2'}`}>
      <Button
        variant="ghost"
        className="h-8 border border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-800 hover:bg-amber-100 hover:text-amber-900"
        onClick={() => onEdit(question)}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        Edit
      </Button>
      <span title="Sắp ra mắt">
        <Button
          variant="ghost"
          disabled
          className="h-8 border border-red-200 bg-red-50 px-2.5 text-xs text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Delete
        </Button>
      </span>
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

export function QuestionItem({ question, onEdit }: QuestionItemProps) {
  return (
    <article className="grid grid-cols-1 items-start gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Question</p>
        <p className="line-clamp-2 text-sm font-medium text-slate-900" title={question.content}>
          {question.content}
        </p>
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Type</p>
        <TypeBadge question={question} />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Difficulty</p>
        <DifficultyBadge question={question} />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Options</p>
        <p className="text-sm text-slate-700">{question.options.length}</p>
      </div>
      <QuestionActions question={question} onEdit={onEdit} />
    </article>
  )
}

export function QuestionTableRow({ question, onEdit }: QuestionItemProps) {
  return (
    <TableRow>
      <TableCell className="max-w-0 overflow-hidden">
        <p className="line-clamp-2 text-sm font-medium text-slate-900" title={question.content}>
          {question.content}
        </p>
      </TableCell>
      <TableCell>
        <TypeBadge question={question} />
      </TableCell>
      <TableCell>
        <DifficultyBadge question={question} />
      </TableCell>
      <TableCell>{question.options.length}</TableCell>
      <TableCell className="whitespace-nowrap">
        <QuestionActions question={question} onEdit={onEdit} spread />
      </TableCell>
    </TableRow>
  )
}
