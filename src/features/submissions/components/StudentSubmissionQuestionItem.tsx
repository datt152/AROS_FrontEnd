import { useState } from 'react'

import type { StudentSubmissionDetailItem } from '../types/submission.types'

type StudentSubmissionQuestionItemProps = {
  item: StudentSubmissionDetailItem
  showCorrectAnswer: boolean
}

export function StudentSubmissionQuestionItem({ item, showCorrectAnswer }: StudentSubmissionQuestionItemProps) {
  const [expanded, setExpanded] = useState(false)
  const preview = item.content.length > 120 && !expanded ? `${item.content.slice(0, 120)}…` : item.content

  return (
    <article className="rounded-2xl border border-slate-200 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Câu {item.order}</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{preview}</p>
          {item.content.length > 120 ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          ) : null}
        </div>
        <span className="shrink-0 text-lg font-semibold tabular-nums">
          {item.isCorrect === null ? '—' : item.isCorrect ? '✓' : '✗'}
        </span>
      </div>

      <div className={`mt-3 grid gap-2 text-sm ${showCorrectAnswer ? 'sm:grid-cols-2' : ''}`}>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-400">Đáp án chọn</p>
          <p className="mt-0.5 font-medium text-slate-800">{item.selectedAnswer || '—'}</p>
        </div>
        {showCorrectAnswer ? (
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-400">Đáp án đúng</p>
            <p className="mt-0.5 font-medium text-slate-800">{item.correctAnswer || '—'}</p>
          </div>
        ) : null}
      </div>
    </article>
  )
}
