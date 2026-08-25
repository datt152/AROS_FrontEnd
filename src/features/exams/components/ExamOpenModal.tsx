import { useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { ExamItem, ExamOpenErrors, ExamOpenValues } from '../types/exam.types'
import { canOpenExam, getOpenExamBlockReason } from '../types/exam.types'

type ExamOpenModalProps = {
  exam: ExamItem
  isSubmitting?: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (values: ExamOpenValues) => void | Promise<void>
}

function toLocalInputValue(iso?: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ExamOpenModal({
  exam,
  isSubmitting = false,
  submitError = null,
  onClose,
  onSubmit,
}: ExamOpenModalProps) {
  const readiness = canOpenExam(exam)
  const blockReason = getOpenExamBlockReason(exam)
  const [values, setValues] = useState<ExamOpenValues>({
    status: 'ONGOING',
    startAt: toLocalInputValue(exam.startAt) || toLocalInputValue(new Date().toISOString()),
    endAt: toLocalInputValue(exam.endAt),
  })
  const [errors, setErrors] = useState<ExamOpenErrors>({})

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!readiness.ready) return

    const nextErrors: ExamOpenErrors = {}
    if (!values.status) nextErrors.status = 'Chọn trạng thái mở thi'
    if (values.startAt && values.endAt && new Date(values.endAt) <= new Date(values.startAt)) {
      nextErrors.endAt = 'Thời gian kết thúc phải sau thời gian bắt đầu'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await onSubmit({
      status: values.status,
      startAt: values.startAt ? new Date(values.startAt).toISOString() : '',
      endAt: values.endAt ? new Date(values.endAt).toISOString() : '',
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Mở thi</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{exam.title}</h3>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Đóng">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mb-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
          <p className={readiness.hasClassrooms ? 'text-emerald-700' : 'text-slate-500'}>
            {readiness.hasClassrooms ? '✓ Đã giao lớp' : '○ Cần giao ít nhất 1 lớp'}
          </p>
          <p className={readiness.hasVersions ? 'text-emerald-700' : 'text-slate-500'}>
            {readiness.hasVersions ? '✓ Đã có mã đề' : '○ Cần sinh mã đề trước'}
          </p>
        </div>

        {!readiness.ready ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{blockReason}</p>
        ) : null}

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          {submitError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
          ) : null}

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="radio"
                name="openStatus"
                checked={values.status === 'ONGOING'}
                disabled={isSubmitting || !readiness.ready}
                onChange={() => setValues((current) => ({ ...current, status: 'ONGOING' }))}
                className="h-4 w-4 border-slate-300 text-blue-600"
              />
              Mở ngay (ONGOING)
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="radio"
                name="openStatus"
                checked={values.status === 'UPCOMING'}
                disabled={isSubmitting || !readiness.ready}
                onChange={() => setValues((current) => ({ ...current, status: 'UPCOMING' }))}
                className="h-4 w-4 border-slate-300 text-blue-600"
              />
              Lên lịch (UPCOMING)
            </label>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="startAt" className="text-sm font-medium text-slate-700">
              Bắt đầu (tùy chọn)
            </label>
            <Input
              id="startAt"
              type="datetime-local"
              value={values.startAt}
              disabled={isSubmitting || !readiness.ready}
              onChange={(event) => setValues((current) => ({ ...current, startAt: event.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="endAt" className="text-sm font-medium text-slate-700">
              Kết thúc (tùy chọn)
            </label>
            <Input
              id="endAt"
              type="datetime-local"
              value={values.endAt}
              hasError={Boolean(errors.endAt)}
              disabled={isSubmitting || !readiness.ready}
              onChange={(event) => setValues((current) => ({ ...current, endAt: event.target.value }))}
            />
            {errors.endAt ? <p className="text-sm text-red-500">{errors.endAt}</p> : null}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" disabled={isSubmitting} onClick={onClose}>
              Hủy
            </Button>
            <span className="flex-1" title={blockReason ?? undefined}>
              <Button type="submit" className="w-full" disabled={isSubmitting || !readiness.ready}>
                {isSubmitting ? 'Đang mở...' : 'Xác nhận mở thi'}
              </Button>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
