import { Printer, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '../../../lib/apiError'
import { useDownloadExamVersionPdf } from '../hooks/useExams'

type ExamPrintVersionsDialogProps = {
  examId: number
  examTitle: string
  versionCodes: string[]
  onClose: () => void
}

export function ExamPrintVersionsDialog({
  examId,
  examTitle,
  versionCodes,
  onClose,
}: ExamPrintVersionsDialogProps) {
  const downloadPdf = useDownloadExamVersionPdf()
  const [selectedCodes, setSelectedCodes] = useState<string[]>(() => [...versionCodes])
  const [error, setError] = useState<string | null>(null)

  const allSelected = versionCodes.length > 0 && selectedCodes.length === versionCodes.length
  const selectedCount = selectedCodes.length

  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes])

  function toggleCode(code: string) {
    setError(null)
    setSelectedCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    )
  }

  function selectAll() {
    setError(null)
    setSelectedCodes([...versionCodes])
  }

  function clearAll() {
    setError(null)
    setSelectedCodes([])
  }

  async function handlePrint() {
    if (selectedCodes.length === 0) {
      setError('Chọn ít nhất một mã đề để in')
      return
    }
    setError(null)
    try {
      await downloadPdf.mutateAsync({
        examId,
        versionCodes: selectedCodes,
        fileNamePrefix: examTitle || `de-${examId}`,
      })
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải PDF mã đề'))
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 px-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Đóng" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">In đề OMR</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Chọn mã đề cần in</h3>
            <p className="mt-1 text-sm text-slate-500">
              Đã chọn {selectedCount}/{versionCodes.length} mã
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={downloadPdf.isPending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            disabled={downloadPdf.isPending || allSelected}
            onClick={selectAll}
          >
            Chọn tất cả
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-3 text-xs"
            disabled={downloadPdf.isPending || selectedCount === 0}
            onClick={clearAll}
          >
            Bỏ chọn tất cả
          </Button>
        </div>

        <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
          {versionCodes.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm text-slate-500">Chưa có mã đề.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {versionCodes.map((code) => {
                const selected = selectedSet.has(code)
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={downloadPdf.isPending}
                    onClick={() => toggleCode(code)}
                    className={`rounded-xl border px-3 py-3 text-center text-sm font-semibold transition ${
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm ring-2 ring-blue-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-800'
                    }`}
                  >
                    {code}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={downloadPdf.isPending}
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={downloadPdf.isPending || selectedCount === 0}
            onClick={() => void handlePrint()}
          >
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            {downloadPdf.isPending
              ? 'Đang tải...'
              : selectedCount > 1
                ? `In ${selectedCount} mã`
                : 'In PDF'}
          </Button>
        </div>
      </div>
    </div>
  )
}
