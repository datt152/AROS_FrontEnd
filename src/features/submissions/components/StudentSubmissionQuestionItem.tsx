import type { StudentSubmissionDetailItem } from '../types/submission.types'

type StudentSubmissionQuestionItemProps = {
  item: StudentSubmissionDetailItem
  showCorrectAnswer: boolean
}

function optionClassName(selected: boolean, correct: boolean | null, showCorrectAnswer: boolean) {
  if (selected) {
    return 'border-emerald-400 bg-emerald-50 text-emerald-900'
  }
  if (showCorrectAnswer && correct === true) {
    return 'border-red-400 bg-red-50 text-red-900'
  }
  return 'border-slate-200 bg-white text-slate-700'
}

export function StudentSubmissionQuestionItem({
  item,
  showCorrectAnswer,
}: StudentSubmissionQuestionItemProps) {
  const hasOptions = item.options.length > 0

  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Câu {item.order}</p>
      <p className="mt-2 text-base font-medium leading-relaxed text-slate-900">{item.content}</p>

      {hasOptions ? (
        <ul className="mt-4 space-y-2">
          {item.options.map((option) => (
            <li
              key={option.label}
              className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm ${optionClassName(
                option.selected,
                option.correct,
                showCorrectAnswer,
              )}`}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-semibold">
                {option.label}
              </span>
              <span className="min-w-0 flex-1 font-medium">{option.content || '—'}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 space-y-2">
          {item.selectedAnswer ? (
            <li className="rounded-xl border border-emerald-400 bg-emerald-50 px-3.5 py-3 text-sm font-medium text-emerald-900">
              {item.selectedAnswer}
            </li>
          ) : null}
          {showCorrectAnswer && item.correctAnswer && item.correctAnswer !== item.selectedAnswer ? (
            <li className="rounded-xl border border-red-400 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-900">
              {item.correctAnswer}
            </li>
          ) : null}
        </ul>
      )}
    </article>
  )
}
