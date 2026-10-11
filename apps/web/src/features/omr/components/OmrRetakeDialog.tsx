import { AlertTriangle, Upload, X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import type { ResolvedOmrError } from '../lib/omrErrors'

type OmrRetakeDialogProps = {
  error: ResolvedOmrError
  onClose: () => void
  onRetake: () => void
}

export function OmrRetakeDialog({ error, onClose, onRetake }: OmrRetakeDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="alertdialog"
        aria-labelledby="omr-retake-title"
        aria-describedby="omr-retake-desc"
        className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-red-600">Chụp lại</p>
              <h2 id="omr-retake-title" className="mt-0.5 text-lg font-semibold text-slate-900">
                {error.title}
              </h2>
            </div>
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

        <p id="omr-retake-desc" className="text-sm text-slate-600">
          {error.description}
        </p>
        {error.fileName ? (
          <p className="mt-2 text-xs text-slate-500">File: {error.fileName}</p>
        ) : null}
        {error.hint && error.hint !== error.description ? (
          <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800">{error.hint}</p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Đóng
          </Button>
          <Button type="button" className="flex-1" onClick={onRetake}>
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            Chụp / chọn ảnh lại
          </Button>
        </div>
      </div>
    </div>
  )
}
