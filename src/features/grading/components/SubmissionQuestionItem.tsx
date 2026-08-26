import type { SubmissionDetailItem } from '../types/grading.types'

type SubmissionQuestionItemProps = {
  item: SubmissionDetailItem
}

export function SubmissionQuestionItem({ item }: SubmissionQuestionItemProps) {
  return (
    <article className="rounded-2xl border border-slate-200 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Câu {item.order}</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{item.content}</p>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${
            item.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {item.isCorrect ? 'Đúng' : 'Sai'}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-400">Đáp án SV</p>
          <p className="mt-0.5 font-medium text-slate-800">{item.selectedAnswer || '—'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-400">Đáp án đúng</p>
          <p className="mt-0.5 font-medium text-slate-800">{item.correctAnswer}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Điểm thô: {item.rawPoint} · {item.type === 'MULTIPLE_CHOICE' ? 'Nhiều đáp án' : 'Một đáp án'}
      </p>
    </article>
  )
}
