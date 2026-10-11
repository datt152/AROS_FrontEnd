import { Button } from '../../../components/ui/Button'

type ExamTakeSubmitDialogProps = {
  open: boolean
  unansweredCount: number
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ExamTakeSubmitDialog({
  open,
  unansweredCount,
  isSubmitting,
  onClose,
  onConfirm,
}: ExamTakeSubmitDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-confirm-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h2 id="submit-confirm-title" className="text-lg font-semibold text-slate-900">
          Xác nhận nộp bài
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Bạn có chắc chắn muốn nộp bài không? Sau khi nộp bạn không thể sửa bài.
        </p>
        {unansweredCount > 0 ? (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Còn {unansweredCount} câu chưa trả lời.
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" className="h-10 px-4" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="button" className="h-10 px-4" disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        </div>
      </div>
    </div>
  )
}
