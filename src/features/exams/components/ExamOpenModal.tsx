import { useMemo, useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { focusFirstFormError } from '../../../utils/focusFormError'
import type { ExamItem, ExamOpenErrors, ExamOpenValues } from '../types/exam.types'
import { canOpenExam, getOpenExamBlockReason } from '../types/exam.types'

type ExamOpenModalProps = {
  exam: ExamItem
  /** Nhãn UI — mặc định “Mở thi”; luyện tập truyền “Mở luyện tập” */
  title?: string
  isSubmitting?: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (values: ExamOpenValues) => void | Promise<void>
}

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Làm tròn lên phút kế tiếp để min datetime-local không dính quá khứ sát hiện tại */
function minFutureLocalInputValue() {
  const date = new Date()
  date.setSeconds(0, 0)
  date.setMinutes(date.getMinutes() + 1)
  return toLocalInputValue(date)
}

export function ExamOpenModal({
  exam,
  title = 'Mở thi',
  isSubmitting = false,
  submitError = null,
  onClose,
  onSubmit,
}: ExamOpenModalProps) {
  const readiness = canOpenExam(exam)
  const blockReason = getOpenExamBlockReason(exam)
  const [values, setValues] = useState<ExamOpenValues>({
    status: 'ONGOING',
    startAt: '',
    endAt: '',
  })
  const [errors, setErrors] = useState<ExamOpenErrors>({})

  const minDateTime = useMemo(() => minFutureLocalInputValue(), [])
  const isSchedule = values.status === 'UPCOMING'

  function setStatus(status: ExamOpenValues['status']) {
    setErrors({})
    setValues({
      status,
      startAt: '',
      endAt: '',
    })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!readiness.ready) return

    const nextErrors: ExamOpenErrors = {}
    const now = Date.now()

    if (values.status === 'ONGOING') {
      setErrors({})
      await onSubmit({
        status: 'ONGOING',
        startAt: new Date().toISOString(),
        endAt: '',
      })
      return
    }

    if (!values.startAt) nextErrors.startAt = 'Chọn thời gian bắt đầu'
    if (!values.endAt) nextErrors.endAt = 'Chọn thời gian kết thúc'

    if (values.startAt) {
      const startMs = new Date(values.startAt).getTime()
      if (Number.isNaN(startMs) || startMs <= now) {
        nextErrors.startAt = 'Thời gian bắt đầu phải sau thời điểm hiện tại'
      }
    }

    if (values.endAt) {
      const endMs = new Date(values.endAt).getTime()
      if (Number.isNaN(endMs) || endMs <= now) {
        nextErrors.endAt = 'Thời gian kết thúc phải sau thời điểm hiện tại'
      }
    }

    if (values.startAt && values.endAt) {
      const startMs = new Date(values.startAt).getTime()
      const endMs = new Date(values.endAt).getTime()
      if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && endMs <= startMs) {
        nextErrors.endAt = 'Thời gian kết thúc phải sau thời gian bắt đầu'
      }
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, ['startAt', 'endAt'])
      return
    }

    await onSubmit({
      status: 'UPCOMING',
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{title}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{exam.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Đóng"
          >
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
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {blockReason}
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          {submitError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </p>
          ) : null}

          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
              <input
                type="radio"
                name="openStatus"
                checked={values.status === 'ONGOING'}
                disabled={isSubmitting || !readiness.ready}
                onChange={() => setStatus('ONGOING')}
                className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600"
              />
              <span>
                <span className="font-medium">Mở ngay</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Mở ngay lúc này. Không đặt lịch kết thúc — giáo viên chủ động đóng.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
              <input
                type="radio"
                name="openStatus"
                checked={values.status === 'UPCOMING'}
                disabled={isSubmitting || !readiness.ready}
                onChange={() => setStatus('UPCOMING')}
                className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600"
              />
              <span>
                <span className="font-medium">Lên lịch</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Chọn thời gian bắt đầu và kết thúc sau thời điểm hiện tại.
                </span>
              </span>
            </label>
          </div>

          {isSchedule ? (
            <>
              <div className="space-y-1.5">
                <label htmlFor="startAt" className="text-sm font-medium text-slate-700">
                  Bắt đầu
                </label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  min={minDateTime}
                  value={values.startAt}
                  hasError={Boolean(errors.startAt)}
                  disabled={isSubmitting || !readiness.ready}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, startAt: event.target.value }))
                  }
                />
                {errors.startAt ? <p className="text-sm text-red-500">{errors.startAt}</p> : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="endAt" className="text-sm font-medium text-slate-700">
                  Kết thúc
                </label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  min={values.startAt || minDateTime}
                  value={values.endAt}
                  hasError={Boolean(errors.endAt)}
                  disabled={isSubmitting || !readiness.ready}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, endAt: event.target.value }))
                  }
                />
                {errors.endAt ? <p className="text-sm text-red-500">{errors.endAt}</p> : null}
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Đề sẽ mở ngay khi xác nhận. Không cần chọn thời gian; đóng bằng nút “Đóng” trên danh sách /
              chi tiết.
            </p>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" disabled={isSubmitting} onClick={onClose}>
              Hủy
            </Button>
            <span className="flex-1" title={blockReason ?? undefined}>
              <Button type="submit" className="w-full" disabled={isSubmitting || !readiness.ready}>
                {isSubmitting ? 'Đang mở...' : 'Xác nhận'}
              </Button>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
