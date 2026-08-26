import { useMemo, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { QUESTION_TYPE_LABEL } from '../../exams/types/exam.types'
import type {
  ExamTemplateFormErrors,
  ExamTemplateFormValues,
  ExamTemplateItem,
  TemplateQuestionOption,
  TemplateSubjectOption,
} from '../types/examTemplate.types'

type ExamTemplateFormProps = {
  mode: 'create' | 'edit'
  initialValues?: ExamTemplateItem
  subjectOptions: TemplateSubjectOption[]
  questionOptions: TemplateQuestionOption[]
  topicOptions?: { id: number; name: string }[]
  isSubmitting?: boolean
  submitError?: string | null
  onSubjectChange?: (subjectId: number) => void
  onSubmit: (values: ExamTemplateFormValues) => void | Promise<void>
  onCancel: () => void
}

const selectClassName = (hasError: boolean) =>
  `h-10 w-full rounded-xl border bg-slate-50/70 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 disabled:opacity-60 ${
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
  }`

function toFormValues(item?: ExamTemplateItem): ExamTemplateFormValues {
  return {
    title: item?.title ?? '',
    subjectId: item?.subjectId ?? '',
    questionIds: item?.questionIds ?? [],
  }
}

export function ExamTemplateForm({
  mode,
  initialValues,
  subjectOptions,
  questionOptions,
  topicOptions = [],
  isSubmitting = false,
  submitError = null,
  onSubjectChange,
  onSubmit,
  onCancel,
}: ExamTemplateFormProps) {
  const [topicFilter, setTopicFilter] = useState<number | ''>('')
  const [values, setValues] = useState<ExamTemplateFormValues>(() => toFormValues(initialValues))
  const [errors, setErrors] = useState<ExamTemplateFormErrors>({})

  const availableQuestions = useMemo(() => {
    if (!values.subjectId) return []
    return questionOptions.filter((question) => {
      if (question.subjectId !== values.subjectId) return false
      if (topicFilter !== '' && question.topicId !== topicFilter) return false
      return true
    })
  }, [questionOptions, values.subjectId, topicFilter])

  function updateSubject(subjectId: number | '') {
    setValues((current) => ({
      ...current,
      subjectId,
      questionIds: [],
    }))
    setTopicFilter('')
    setErrors((current) => ({ ...current, subjectId: undefined, questionIds: undefined }))
    if (typeof subjectId === 'number' && subjectId > 0) onSubjectChange?.(subjectId)
  }

  function toggleQuestion(questionId: number) {
    setValues((current) => ({
      ...current,
      questionIds: current.questionIds.includes(questionId)
        ? current.questionIds.filter((id) => id !== questionId)
        : [...current.questionIds, questionId],
    }))
    setErrors((current) => ({ ...current, questionIds: undefined }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors: ExamTemplateFormErrors = {}
    if (!values.title.trim()) nextErrors.title = 'Vui lòng nhập tiêu đề'
    if (!values.subjectId) nextErrors.subjectId = 'Vui lòng chọn môn học'
    if (values.questionIds.length < 1) nextErrors.questionIds = 'Chọn ít nhất 1 câu hỏi'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await onSubmit({
      title: values.title.trim(),
      subjectId: Number(values.subjectId),
      questionIds: values.questionIds,
    })
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Tiêu đề
        </label>
        <Input
          id="title"
          value={values.title}
          hasError={Boolean(errors.title)}
          placeholder="Vui lòng nhập tiêu đề"
          disabled={isSubmitting}
          onChange={(event) => {
            setValues((current) => ({ ...current, title: event.target.value }))
            setErrors((current) => ({ ...current, title: undefined }))
          }}
        />
        {errors.title ? <p className="text-sm text-red-500">{errors.title}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="subjectId" className="text-sm font-medium text-slate-700">
          Môn học
        </label>
        <select
          id="subjectId"
          value={values.subjectId}
          disabled={isSubmitting || mode === 'edit'}
          onChange={(event) => {
            const next = event.target.value === '' ? '' : Number(event.target.value)
            updateSubject(next)
          }}
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

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-800">Chọn câu hỏi</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {values.subjectId ? 'Chọn câu hỏi thuộc môn đã chọn.' : 'Chọn môn trước để tải câu hỏi.'}
          </p>
        </div>

        {values.subjectId ? (
          <select
            value={topicFilter}
            disabled={isSubmitting}
            onChange={(event) =>
              setTopicFilter(event.target.value === '' ? '' : Number(event.target.value))
            }
            className={selectClassName(false)}
          >
            <option value="">Tất cả chủ đề</option>
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        ) : null}

        {errors.questionIds ? <p className="text-sm text-red-500">{errors.questionIds}</p> : null}

        {!values.subjectId ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
            Chọn môn để hiện danh sách câu hỏi.
          </p>
        ) : availableQuestions.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
            Không có câu hỏi phù hợp.
          </p>
        ) : (
          <ul className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2">
            {availableQuestions.map((question) => (
              <li key={question.questionId}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={values.questionIds.includes(question.questionId)}
                    disabled={isSubmitting}
                    onChange={() => toggleQuestion(question.questionId)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{question.content}</p>
                    <p className="mt-1 text-xs text-slate-500">{QUESTION_TYPE_LABEL[question.type]}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-500">Đã chọn {values.questionIds.length} câu</p>
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
              ? 'Tạo template'
              : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  )
}
