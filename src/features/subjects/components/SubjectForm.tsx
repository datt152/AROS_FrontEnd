import { useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { SubjectFormErrors, SubjectFormValues, SubjectItem } from '../types/subject.types'

type SubjectFormProps = {
  mode: 'create' | 'edit'
  initialValues?: SubjectItem
  onSubmit: (values: SubjectFormValues) => void
  onCancel: () => void
}

function toFormValues(item?: SubjectItem): SubjectFormValues {
  return {
    subjectName: item?.subjectName ?? '',
    description: item?.description ?? '',
  }
}

export function SubjectForm({ mode, initialValues, onSubmit, onCancel }: SubjectFormProps) {
  const [values, setValues] = useState<SubjectFormValues>(() => toFormValues(initialValues))
  const [errors, setErrors] = useState<SubjectFormErrors>({})

  function updateField<K extends keyof SubjectFormValues>(key: K, value: SubjectFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: SubjectFormErrors = {}

    if (!values.subjectName.trim()) {
      nextErrors.subjectName = 'Please enter a subject name'
    } else if (values.subjectName.trim().length < 2) {
      nextErrors.subjectName = 'Subject name must be at least 2 characters'
    }

    if (!values.description.trim()) {
      nextErrors.description = 'Please enter a description'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      subjectName: values.subjectName.trim(),
      description: values.description.trim(),
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="subjectName" className="text-sm font-medium text-slate-700">
          Subject name
        </label>
        <Input
          id="subjectName"
          name="subjectName"
          value={values.subjectName}
          hasError={Boolean(errors.subjectName)}
          placeholder="e.g. Software Engineering"
          onChange={(event) => updateField('subjectName', event.target.value)}
        />
        {errors.subjectName ? <p className="text-sm text-red-500">{errors.subjectName}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={values.description}
          placeholder="Short description of the subject"
          onChange={(event) => updateField('description', event.target.value)}
          className={`w-full rounded-xl border bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
            errors.description
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
          }`}
        />
        {errors.description ? <p className="text-sm text-red-500">{errors.description}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{mode === 'create' ? 'Create subject' : 'Save changes'}</Button>
      </div>
    </form>
  )
}
