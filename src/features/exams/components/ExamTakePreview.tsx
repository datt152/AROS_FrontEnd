import { Flag } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { QUESTION_TYPE_LABEL } from '../types/exam.types'
import type { TakeQuestion } from './ExamTakeQuestionPanel'

type ExamTakePreviewProps = {
  questions: TakeQuestion[]
  answers: Record<number, string | string[]>
  flagged: Set<number>
  onEdit: (index: number) => void
  onSubmitClick: () => void
  canSubmit: boolean
  isSubmitting: boolean
  submitLabel: string
}

function formatAnswer(value: string | string[] | undefined) {
  if (value === undefined) return null
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : null
  return value || null
}

export function ExamTakePreview({
  questions,
  answers,
  flagged,
  onEdit,
  onSubmitClick,
  canSubmit,
  isSubmitting,
  submitLabel,
}: ExamTakePreviewProps) {
  const unanswered = questions.filter((q) => !formatAnswer(answers[q.questionId])).length

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Xem lại bài làm</h2>
            <p className="mt-1 text-sm text-slate-500">
              Kiểm tra đáp án trước khi nộp.
              {unanswered > 0 ? (
                <span className="ml-1 font-medium text-amber-700">Còn {unanswered} câu chưa trả lời.</span>
              ) : (
                <span className="ml-1 font-medium text-emerald-700">Đã trả lời đủ câu.</span>
              )}
            </p>
          </div>

          <ul className="space-y-3">
            {questions.map((question, index) => {
              const answerText = formatAnswer(answers[question.questionId])
              const isFlagged = flagged.has(question.questionId)
              return (
                <li
                  key={question.questionId}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Câu {index + 1}
                        </p>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                          {QUESTION_TYPE_LABEL[question.type]}
                        </span>
                        {isFlagged ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                            <Flag className="h-3 w-3 fill-current" strokeWidth={2} />
                            Gắn cờ
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-slate-900">{question.content}</p>
                      <p className="mt-2 text-sm">
                        <span className="text-slate-500">Đáp án: </span>
                        {answerText ? (
                          <span className="font-semibold text-slate-900">{answerText}</span>
                        ) : (
                          <span className="font-medium text-amber-700">Chưa chọn</span>
                        )}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 shrink-0 px-3 text-xs"
                      onClick={() => onEdit(index)}
                    >
                      Sửa
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-end gap-2">
          <Button type="button" className="h-10 min-w-40 px-5" disabled={!canSubmit} onClick={onSubmitClick}>
            {isSubmitting ? 'Đang nộp...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
