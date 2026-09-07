import { useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { ExamVersionCreateErrors, ExamVersionCreateValues } from '../types/exam.types'

type ExamVersionGenerateModalProps = {
  examTitle: string
  isSubmitting?: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (values: ExamVersionCreateValues) => void | Promise<void>
}

export function ExamVersionGenerateModal({
  examTitle,
  isSubmitting = false,
  submitError = null,
  onClose,
  onSubmit,
}: ExamVersionGenerateModalProps) {
  const [values, setValues] = useState<ExamVersionCreateValues>({
    mode: 'auto',
    manualVersionCodes: [],
    autoGenerateCount: 2,
    replaceExisting: false,
  })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<ExamVersionCreateErrors>({})

  function addTag(raw: string) {
    const code = raw.trim().toUpperCase()
    if (!code) return
    if (values.manualVersionCodes.includes(code)) {
      setTagInput('')
      return
    }
    setValues((current) => ({
      ...current,
      manualVersionCodes: [...current.manualVersionCodes, code],
    }))
    setTagInput('')
    setErrors((current) => ({ ...current, manualVersionCodes: undefined }))
  }

  function removeTag(code: string) {
    setValues((current) => ({
      ...current,
      manualVersionCodes: current.manualVersionCodes.filter((item) => item !== code),
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors: ExamVersionCreateErrors = {}
    if (values.mode === 'manual' && values.manualVersionCodes.length === 0) {
      nextErrors.manualVersionCodes = 'Nhập ít nhất một mã đề'
    }
    if (values.mode === 'auto' && (values.autoGenerateCount === '' || Number(values.autoGenerateCount) < 1)) {
      nextErrors.autoGenerateCount = 'Số lượng phải ≥ 1'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Sinh mã đề</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{examTitle}</h3>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Đóng">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${values.mode === 'auto' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setValues((current) => ({ ...current, mode: 'auto' }))}
          >
            Số lượng
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${values.mode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setValues((current) => ({ ...current, mode: 'manual' }))}
          >
            Nhập tay
          </button>
        </div>

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          {submitError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
          ) : null}

          {values.mode === 'auto' ? (
            <div className="space-y-1.5">
              <label htmlFor="autoGenerateCount" className="text-sm font-medium text-slate-700">
                Số lượng mã đề
              </label>
              <Input
                id="autoGenerateCount"
                type="number"
                min={1}
                value={values.autoGenerateCount}
                hasError={Boolean(errors.autoGenerateCount)}
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    autoGenerateCount: event.target.value === '' ? '' : Number(event.target.value),
                  }))
                }
              />
              {errors.autoGenerateCount ? <p className="text-sm text-red-500">{errors.autoGenerateCount}</p> : null}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label htmlFor="manualCodes" className="text-sm font-medium text-slate-700">
                Mã đề (Enter để thêm)
              </label>
              <Input
                id="manualCodes"
                value={tagInput}
                hasError={Boolean(errors.manualVersionCodes)}
                placeholder="vd. A rồi Enter"
                disabled={isSubmitting}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault()
                    addTag(tagInput)
                  }
                }}
              />
              {values.manualVersionCodes.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {values.manualVersionCodes.map((code) => (
                    <button
                      key={code}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => removeTag(code)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                    >
                      {code}
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  ))}
                </div>
              ) : null}
              {errors.manualVersionCodes ? <p className="text-sm text-red-500">{errors.manualVersionCodes}</p> : null}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" disabled={isSubmitting} onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Đang sinh...' : 'Sinh mã đề'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
