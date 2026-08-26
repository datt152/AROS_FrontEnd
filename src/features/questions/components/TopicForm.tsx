import { useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { TopicFormErrors, TopicFormValues, TopicItem } from '../types/topic.types'

type TopicFormProps = {
  mode: 'create' | 'edit'
  initialValues?: TopicItem
  isSubmitting?: boolean
  submitError?: string | null
  onSubmit: (values: TopicFormValues) => void | Promise<void>
  onCancel: () => void
}

function toFormValues(item?: TopicItem): TopicFormValues {
  return {
    name: item?.name ?? '',
    description: item?.description ?? '',
    displayOrder: item?.displayOrder ?? 1,
  }
}

export function TopicForm({
  mode,
  initialValues,
  isSubmitting = false,
  submitError = null,
  onSubmit,
  onCancel,
}: TopicFormProps) {
  const [values, setValues] = useState<TopicFormValues>(() => toFormValues(initialValues))
  const [errors, setErrors] = useState<TopicFormErrors>({})

  function updateField<K extends keyof TopicFormValues>(key: K, value: TopicFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: TopicFormErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Vui lòng nhập tên chủ đề'
    if (values.displayOrder === '' || Number(values.displayOrder) < 0) {
      nextErrors.displayOrder = 'Thứ tự phải ≥ 0'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      displayOrder: Number(values.displayOrder),
    })
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="topicName" className="text-sm font-medium text-slate-700">
          Tên chủ đề
        </label>
        <Input
          id="topicName"
          value={values.name}
          hasError={Boolean(errors.name)}
          placeholder="vd. Chương 1 — Giới thiệu"
          disabled={isSubmitting}
          onChange={(event) => updateField('name', event.target.value)}
        />
        {errors.name ? <p className="text-sm text-red-500">{errors.name}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="topicDescription" className="text-sm font-medium text-slate-700">
          Mô tả
        </label>
        <textarea
          id="topicDescription"
          rows={3}
          value={values.description}
          disabled={isSubmitting}
          placeholder="Mô tả ngắn (tuỳ chọn)"
          onChange={(event) => updateField('description', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="displayOrder" className="text-sm font-medium text-slate-700">
          Thứ tự hiển thị
        </label>
        <Input
          id="displayOrder"
          type="number"
          min={0}
          value={values.displayOrder}
          hasError={Boolean(errors.displayOrder)}
          disabled={isSubmitting}
          onChange={(event) =>
            updateField('displayOrder', event.target.value === '' ? '' : Number(event.target.value))
          }
        />
        {errors.displayOrder ? <p className="text-sm text-red-500">{errors.displayOrder}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'create'
              ? 'Đang tạo...'
              : 'Đang lưu...'
            : mode === 'create'
              ? 'Tạo chủ đề'
              : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  )
}
