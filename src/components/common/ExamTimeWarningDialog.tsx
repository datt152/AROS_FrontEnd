import { Clock } from 'lucide-react'

import { Button } from '../ui/Button'

type ExamTimeWarningDialogProps = {
  secondsLeft: number
  open: boolean
  onDismiss: () => void
}

export function ExamTimeWarningDialog({ secondsLeft, open, onDismiss }: ExamTimeWarningDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-time-warning-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Clock className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <h2 id="exam-time-warning-title" className="mt-4 text-center text-lg font-semibold text-slate-900">
          Sắp hết thời gian làm bài
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Còn{' '}
          <span className="font-semibold tabular-nums text-amber-700">{secondsLeft}</span> giây nữa là hết thời gian
          làm bài. Khi hết giờ, hệ thống sẽ <span className="font-medium text-slate-800">tự động nộp bài</span> với
          các câu bạn đã chọn.
        </p>
        <div className="mt-6">
          <Button className="w-full" onClick={onDismiss}>
            Đã hiểu, tiếp tục làm bài
          </Button>
        </div>
      </div>
    </div>
  )
}
