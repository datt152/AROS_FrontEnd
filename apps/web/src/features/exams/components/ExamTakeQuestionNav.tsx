import { Flag } from 'lucide-react'

type ExamTakeQuestionNavProps = {
  total: number
  currentIndex: number
  answers: Record<number, string | string[]>
  flagged: Set<number>
  questionIds: number[]
  onSelect: (index: number) => void
}

function hasAnswer(value: string | string[] | undefined) {
  if (value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  return value.length > 0
}

export function ExamTakeQuestionNav({
  total,
  currentIndex,
  answers,
  flagged,
  questionIds,
  onSelect,
}: ExamTakeQuestionNavProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-slate-50/80 lg:w-56">
      <div className="shrink-0 border-b border-slate-200 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Câu hỏi</p>
        <p className="mt-0.5 text-sm text-slate-700">
          {Object.values(answers).filter(hasAnswer).length}/{total} đã trả lời
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
          {Array.from({ length: total }, (_, index) => {
            const qid = questionIds[index]
            const answered = hasAnswer(answers[qid])
            const isFlagged = flagged.has(qid)
            const isCurrent = index === currentIndex
            return (
              <button
                key={qid}
                type="button"
                onClick={() => onSelect(index)}
                className={`relative flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : answered
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
                aria-label={`Câu ${index + 1}${isFlagged ? ' (đã gắn cờ)' : ''}`}
              >
                {index + 1}
                {isFlagged ? (
                  <Flag
                    className={`absolute -right-1 -top-1 h-3 w-3 fill-red-500 text-red-500 ${
                      isCurrent ? 'drop-shadow' : ''
                    }`}
                    strokeWidth={2}
                  />
                ) : null}
              </button>
            )
          })}
        </div>
        <ul className="mt-4 space-y-1.5 text-[11px] text-slate-500">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-600" /> Đang xem
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-emerald-200 bg-emerald-50" /> Đã trả lời
          </li>
          <li className="flex items-center gap-2">
            <Flag className="h-3 w-3 fill-red-500 text-red-500" strokeWidth={2} /> Gắn cờ
          </li>
        </ul>
      </div>
    </aside>
  )
}
