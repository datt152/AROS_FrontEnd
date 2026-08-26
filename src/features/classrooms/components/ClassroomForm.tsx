import { useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type {
  ClassroomFormErrors,
  ClassroomFormValues,
  ClassroomItem,
  SubjectOption,
} from '../types/classroom.types'

type ClassroomFormProps = {
  mode: 'create' | 'edit'
  initialValues?: ClassroomItem
  subjectOptions: SubjectOption[]
  isSubmitting?: boolean
  submitError?: string | null
  onSubmit: (values: ClassroomFormValues) => void | Promise<void>
  onCancel: () => void
}

function toFormValues(item?: ClassroomItem): ClassroomFormValues {
  return {
    className: item?.className ?? '',
    description: item?.description ?? '',
    semester: item?.semester ?? '',
    academicYear: item?.academicYear ?? '',
    isActive: item?.isActive ?? true,
    subjectId: item?.subjectId ?? 0,
  }
}

export function ClassroomForm({
  mode,
  initialValues,
  subjectOptions,
  isSubmitting = false,
  submitError = null,
  onSubmit,
  onCancel,
}: ClassroomFormProps) {
  const [values, setValues] = useState<ClassroomFormValues>(() => toFormValues(initialValues))
  const [errors, setErrors] = useState<ClassroomFormErrors>({})

  function updateField<K extends keyof ClassroomFormValues>(key: K, value: ClassroomFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: ClassroomFormErrors = {}

    if (!values.className.trim()) {
      nextErrors.className = 'Tên lớp học không được để trống'
    }

    if (!values.subjectId) {
      nextErrors.subjectId = 'Môn học không được để trống'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await onSubmit({
      className: values.className.trim(),
      description: values.description.trim(),
      semester: values.semester.trim(),
      academicYear: values.academicYear.trim(),
      isActive: values.isActive,
      subjectId: values.subjectId,
    })
  }

  const selectClassName = (hasError: boolean) =>
    `h-10 w-full rounded-xl border bg-slate-50/70 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 disabled:opacity-60 ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
    }`

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="className" className="text-sm font-medium text-slate-700">
          Tên lớp
        </label>
        <Input
          id="className"
          name="className"
          value={values.className}
          hasError={Boolean(errors.className)}
          placeholder="Vui lòng nhập tên lớp"
          disabled={isSubmitting}
          onChange={(event) => updateField('className', event.target.value)}
        />
        {errors.className ? <p className="text-sm text-red-500">{errors.className}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="subjectId" className="text-sm font-medium text-slate-700">
          Môn học
        </label>
        <select
          id="subjectId"
          name="subjectId"
          value={values.subjectId || ''}
          disabled={isSubmitting}
          onChange={(event) => updateField('subjectId', Number(event.target.value) || 0)}
          className={selectClassName(Boolean(errors.subjectId))}
        >
          <option value="">Chọn môn học</option>
          {subjectOptions.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subjectName}
            </option>
          ))}
        </select>
        {errors.subjectId ? <p className="text-sm text-red-500">{errors.subjectId}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="semester" className="text-sm font-medium text-slate-700">
            Học kỳ
          </label>
          <Input
            id="semester"
            name="semester"
            value={values.semester}
            hasError={Boolean(errors.semester)}
            placeholder="Vui lòng nhập học kỳ"
            disabled={isSubmitting}
            onChange={(event) => updateField('semester', event.target.value)}
          />
          {errors.semester ? <p className="text-sm text-red-500">{errors.semester}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="academicYear" className="text-sm font-medium text-slate-700">
            Năm học
          </label>
          <Input
            id="academicYear"
            name="academicYear"
            value={values.academicYear}
            hasError={Boolean(errors.academicYear)}
            placeholder="Vui lòng nhập năm học"
            disabled={isSubmitting}
            onChange={(event) => updateField('academicYear', event.target.value)}
          />
          {errors.academicYear ? <p className="text-sm text-red-500">{errors.academicYear}</p> : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Mô tả
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={values.description}
          disabled={isSubmitting}
          placeholder="Ghi chú tùy chọn về lớp học"
          onChange={(event) => updateField('description', event.target.value)}
          className={`w-full rounded-xl border bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:opacity-60 ${
            errors.description
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
          }`}
        />
        {errors.description ? <p className="text-sm text-red-500">{errors.description}</p> : null}
      </div>

      <label className="flex items-center gap-2.5 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={values.isActive}
          disabled={isSubmitting}
          onChange={(event) => updateField('isActive', event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100"
        />
        Lớp đang hoạt động
      </label>

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
              ? 'Tạo lớp học'
              : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  )
}
