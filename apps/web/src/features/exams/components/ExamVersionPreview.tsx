import { X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import type { ExamVersionDetailItem } from '../types/exam.types'
import { QUESTION_TYPE_LABEL } from '../types/exam.types'

type ExamVersionPreviewProps = {
  detail: ExamVersionDetailItem
  onClose: () => void
}

export function ExamVersionPreview({ detail, onClose }: ExamVersionPreviewProps) {
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/40">
      <button type="button" className="hidden flex-1 cursor-default sm:block" aria-label="Đóng bảng" onClick={onClose} />
      <aside className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Xem mã đề</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">{detail.title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Mã đề <span className="font-medium text-slate-700">{detail.versionCode}</span> · {detail.duration} phút ·{' '}
              {detail.questions.length} câu
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {detail.questions.map((question, index) => (
            <article key={question.originalQuestionId} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Câu {index + 1}</p>
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {QUESTION_TYPE_LABEL[question.type]}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900">{question.content}</p>
              <ul className="mt-3 space-y-1.5">
                {question.options.map((option) => (
                  <li
                    key={`${question.originalQuestionId}-${option.label}`}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="mr-2 font-semibold text-slate-900">{option.label}.</span>
                    {option.content}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </aside>
    </div>
  )
}
