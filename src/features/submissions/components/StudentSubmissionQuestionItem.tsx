import type { StudentSubmissionDetailItem } from '../types/submission.types'

type StudentSubmissionQuestionItemProps = {
  item: StudentSubmissionDetailItem
  showCorrectAnswer: boolean
}

export function StudentSubmissionQuestionItem({
  item,
  showCorrectAnswer,
}: StudentSubmissionQuestionItemProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Câu {item.order}
          </p>
          <p className="mt-2 text-base font-medium leading-relaxed text-slate-900">{item.content}</p>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2 py-1 text-sm font-semibold ${
            item.isCorrect === true
              ? 'bg-emerald-50 text-emerald-700'
              : item.isCorrect === false
                ? 'bg-red-50 text-red-700'
                : 'bg-slate-100 text-slate-500'
          }`}
        >
          {item.isCorrect === null ? '—' : item.isCorrect ? 'Đúng' : 'Sai'}
        </span>
      </div>

      <div className={`mt-4 grid gap-2 text-sm ${showCorrectAnswer ? 'sm:grid-cols-2' : ''}`}>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-xs text-slate-400">Đáp án chọn</p>
          <p className="mt-0.5 font-medium text-slate-800">{item.selectedAnswer || '—'}</p>
        </div>
        {showCorrectAnswer ? (
          <div className="rounded-xl bg-emerald-50/70 px-3 py-2.5">
            <p className="text-xs text-emerald-700/80">Đáp án đúng</p>
            <p className="mt-0.5 font-medium text-slate-800">{item.correctAnswer || '—'}</p>
          </div>
        ) : null}
      </div>
    </article>
  )
}
