import { useState } from 'react'



import { Button } from '../../../components/ui/Button'

import { Input } from '../../../components/ui/Input'

import type { SubjectFormErrors, SubjectFormValues, SubjectItem } from '../types/subject.types'



type SubjectFormProps = {

  mode: 'create' | 'edit'

  initialValues?: SubjectItem

  isSubmitting?: boolean

  submitError?: string | null

  onSubmit: (values: SubjectFormValues) => void | Promise<void>

  onCancel: () => void

}



function toFormValues(item?: SubjectItem): SubjectFormValues {

  return {

    subjectName: item?.subjectName ?? '',

    description: item?.description ?? '',

  }

}



export function SubjectForm({

  mode,

  initialValues,

  isSubmitting = false,

  submitError = null,

  onSubmit,

  onCancel,

}: SubjectFormProps) {

  const [values, setValues] = useState<SubjectFormValues>(() => toFormValues(initialValues))

  const [errors, setErrors] = useState<SubjectFormErrors>({})



  function updateField<K extends keyof SubjectFormValues>(key: K, value: SubjectFormValues[K]) {

    setValues((current) => ({ ...current, [key]: value }))

    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))

  }



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault()



    const nextErrors: SubjectFormErrors = {}



    if (!values.subjectName.trim()) {

      nextErrors.subjectName = 'Vui lòng nhập tên môn học'

    } else if (values.subjectName.trim().length < 2) {

      nextErrors.subjectName = 'Tên môn học phải có ít nhất 2 ký tự'

    }





    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return



    await onSubmit({

      subjectName: values.subjectName.trim(),

      description: values.description.trim(),

    })

  }



  return (

    <form className="space-y-4" onSubmit={handleSubmit} noValidate>

      {submitError ? (

        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>

      ) : null}



      <div className="space-y-1.5">

        <label htmlFor="subjectName" className="text-sm font-medium text-slate-700">

          Tên môn học

        </label>

        <Input

          id="subjectName"

          name="subjectName"

          value={values.subjectName}

          hasError={Boolean(errors.subjectName)}

          placeholder="Vui lòng nhập tên môn học"

          disabled={isSubmitting}

          onChange={(event) => updateField('subjectName', event.target.value)}

        />

        {errors.subjectName ? <p className="text-sm text-red-500">{errors.subjectName}</p> : null}

      </div>



      <div className="space-y-1.5">

        <label htmlFor="description" className="text-sm font-medium text-slate-700">

          Mô tả

        </label>

        <textarea

          id="description"

          name="description"

          rows={4}

          value={values.description}

          disabled={isSubmitting}

          placeholder="Mô tả ngắn về môn học"

          onChange={(event) => updateField('description', event.target.value)}

          className="w-full rounded-xl border bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:opacity-60 border-slate-200 focus:border-blue-400 focus:ring-blue-100"

        />


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

              ? 'Tạo môn học'

              : 'Lưu thay đổi'}

        </Button>

      </div>

    </form>

  )

}

