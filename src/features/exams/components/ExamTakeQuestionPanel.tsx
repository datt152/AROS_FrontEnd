import { Eraser, Flag } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { QUESTION_TYPE_LABEL, type QuestionType } from '../types/exam.types'

export type TakeQuestion = {
  questionId: number
  content: string
  type: QuestionType
  options: { label: string; content: string }[]
}

type ExamTakeQuestionPanelProps = {
  index: number
  total: number
  question: TakeQuestion
  answer: string | string[] | undefined
  flagged: boolean
  onSingleAnswer: (label: string) => void
  onToggleMulti: (label: string) => void
  onClear: () => void
  onToggleFlag: () => void
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
}

export function ExamTakeQuestionPanel({
  index,
  total,
  question,
  answer,
  flagged,
  onSingleAnswer,
  onToggleMulti,
  onClear,
  onToggleFlag,
  onPrev,
  onNext,
  onFinish,
}: ExamTakeQuestionPanelProps) {
  const isMulti = question.type === 'MULTIPLE_CHOICE'
  const hasAnswer = Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
  const isLast = index >= total - 1

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Câu {index + 1} / {total}
              </p>
              <span className="mt-1 inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {QUESTION_TYPE_LABEL[question.type]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={flagged ? 'danger' : 'secondary'}
                className="h-9 px-3 text-xs"
                onClick={onToggleFlag}
              >
                <Flag className={`h-3.5 w-3.5 ${flagged ? 'fill-current' : ''}`} strokeWidth={2} />
                {flagged ? 'Bỏ cờ' : 'Gắn cờ'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-3 text-xs"
                disabled={!hasAnswer}
                onClick={onClear}
              >
                <Eraser className="h-3.5 w-3.5" strokeWidth={1.75} />
                Xóa đáp án
              </Button>
            </div>
          </div>

          <p className="mt-4 text-base font-medium leading-relaxed text-slate-900">{question.content}</p>

          <ul className="mt-5 space-y-2.5">
            {question.options.map((option) => {
              const selected = isMulti
                ? Array.isArray(answer) && answer.includes(option.label)
                : answer === option.label

              return (
                <li key={option.label}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-sm transition ${
                      selected
                        ? 'border-blue-300 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type={isMulti ? 'checkbox' : 'radio'}
                      name={`q-${question.questionId}`}
                      checked={selected}
                      onChange={() =>
                        isMulti ? onToggleMulti(option.label) : onSingleAnswer(option.label)
                      }
                      className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600"
                    />
                    <span>
                      <span className="mr-1.5 font-semibold">{option.label}.</span>
                      {option.content}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="secondary" className="h-10 px-4" disabled={index === 0} onClick={onPrev}>
            Câu trước
          </Button>
          <div className="flex flex-wrap gap-2">
            {!isLast ? (
              <Button type="button" className="h-10 px-4" onClick={onNext}>
                Câu sau
              </Button>
            ) : null}
            <Button type="button" variant={isLast ? 'primary' : 'secondary'} className="h-10 px-4" onClick={onFinish}>
              Làm xong · Xem lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
