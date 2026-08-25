import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type {
  AnswerOptionItem,
  Difficulty,
  QuestionFormErrors,
  QuestionFormValues,
  QuestionItem,
  QuestionType,
  SubjectOption,
} from '../types/question.types'
import { DIFFICULTY_LABEL, QUESTION_TYPE_LABEL } from '../types/question.types'

type QuestionFormProps = {
  mode: 'create' | 'edit'
  initialValues?: QuestionItem
  subjectOptions: SubjectOption[]
  lockedSubjectId?: number
  isSubmitting?: boolean
  submitError?: string | null
  onSubmit: (values: QuestionFormValues) => void | Promise<void>
  onCancel: () => void
}

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD', 'APPLICATION']
const QUESTION_TYPES: QuestionType[] = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE']

const selectClassName = (hasError: boolean) =>
  `h-10 w-full rounded-xl border bg-slate-50/70 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 disabled:opacity-60 ${
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
  }`

const textareaClassName = (hasError: boolean) =>
  `w-full rounded-xl border bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:opacity-60 ${
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
  }`

function emptyOption(): AnswerOptionItem {
  return { content: '', isCorrect: false }
}

function toFormValues(item?: QuestionItem, lockedSubjectId?: number): QuestionFormValues {
  return {
    subjectId: item?.subjectId ?? lockedSubjectId ?? 0,
    content: item?.content ?? '',
    difficulty: item?.difficulty ?? 'MEDIUM',
    explanation: item?.explanation ?? '',
    options: item?.options?.length ? item.options.map((option) => ({ ...option })) : [emptyOption(), emptyOption()],
    type: item?.type ?? 'SINGLE_CHOICE',
  }
}

function clampCorrectAnswers(options: AnswerOptionItem[], type: QuestionType) {
  if (type !== 'SINGLE_CHOICE') return options

  const firstCorrectIndex = options.findIndex((option) => option.isCorrect)
  return options.map((option, index) => ({
    ...option,
    isCorrect: firstCorrectIndex >= 0 ? index === firstCorrectIndex : false,
  }))
}

export function QuestionForm({
  mode,
  initialValues,
  subjectOptions,
  lockedSubjectId,
  isSubmitting = false,
  submitError = null,
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const [values, setValues] = useState<QuestionFormValues>(() => toFormValues(initialValues, lockedSubjectId))
  const [errors, setErrors] = useState<QuestionFormErrors>({})

  function updateField<K extends keyof QuestionFormValues>(key: K, value: QuestionFormValues[K]) {
    setValues((current) => {
      if (key === 'type') {
        const nextType = value as QuestionType
        return {
          ...current,
          type: nextType,
          options: clampCorrectAnswers(current.options, nextType),
        }
      }

      return { ...current, [key]: value }
    })
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function updateOption(index: number, patch: Partial<AnswerOptionItem>) {
    setValues((current) => {
      const nextOptions = current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      )

      if (patch.isCorrect && current.type === 'SINGLE_CHOICE') {
        return {
          ...current,
          options: nextOptions.map((option, optionIndex) => ({
            ...option,
            isCorrect: optionIndex === index,
          })),
        }
      }

      return { ...current, options: nextOptions }
    })
    setErrors((current) => ({ ...current, options: undefined, optionContents: undefined }))
  }

  function addOption() {
    setValues((current) => ({ ...current, options: [...current.options, emptyOption()] }))
    setErrors((current) => ({ ...current, options: undefined }))
  }

  function removeOption(index: number) {
    setValues((current) => ({
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index),
    }))
    setErrors((current) => ({ ...current, options: undefined, optionContents: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: QuestionFormErrors = {}
    const optionContents: string[] = []

    if (!values.subjectId) nextErrors.subjectId = 'ID Môn học không được rỗng'
    if (!values.content.trim()) nextErrors.content = 'Nội dung câu hỏi không được rỗng'
    if (!values.type) nextErrors.type = 'Loại câu hỏi không được để trống'
    if (values.options.length === 0) nextErrors.options = 'Phải có ít nhất 1 đáp án'

    values.options.forEach((option) => {
      optionContents.push(option.content.trim() ? '' : 'Nội dung đáp án không được rỗng')
    })

    if (optionContents.some(Boolean)) nextErrors.optionContents = optionContents

    const correctCount = values.options.filter((option) => option.isCorrect).length
    if (values.options.length > 0 && !nextErrors.options) {
      if (values.type === 'SINGLE_CHOICE' && correctCount !== 1) {
        nextErrors.options = 'Câu hỏi một đáp án phải có đúng 1 đáp án đúng'
      }
      if (values.type === 'MULTIPLE_CHOICE' && correctCount < 1) {
        nextErrors.options = 'Câu hỏi nhiều đáp án phải có ít nhất 1 đáp án đúng'
      }
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await onSubmit({
      subjectId: values.subjectId,
      content: values.content.trim(),
      difficulty: values.difficulty,
      explanation: values.explanation.trim(),
      type: values.type,
      options: values.options.map((option) => ({
        content: option.content.trim(),
        isCorrect: option.isCorrect,
      })),
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="subjectId" className="text-sm font-medium text-slate-700">
            Subject
          </label>
          <select
            id="subjectId"
            value={values.subjectId || ''}
            disabled={isSubmitting || Boolean(lockedSubjectId && mode === 'create')}
            onChange={(event) => updateField('subjectId', Number(event.target.value) || 0)}
            className={selectClassName(Boolean(errors.subjectId))}
          >
            <option value="">Select a subject</option>
            {subjectOptions.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subjectName}
              </option>
            ))}
          </select>
          {errors.subjectId ? <p className="text-sm text-red-500">{errors.subjectId}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="type" className="text-sm font-medium text-slate-700">
            Question type
          </label>
          <select
            id="type"
            value={values.type}
            disabled={isSubmitting}
            onChange={(event) => updateField('type', event.target.value as QuestionType)}
            className={selectClassName(Boolean(errors.type))}
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {QUESTION_TYPE_LABEL[type]}
              </option>
            ))}
          </select>
          {errors.type ? <p className="text-sm text-red-500">{errors.type}</p> : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="difficulty" className="text-sm font-medium text-slate-700">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={values.difficulty ?? ''}
          disabled={isSubmitting}
          onChange={(event) =>
            updateField('difficulty', (event.target.value || null) as Difficulty | null)
          }
          className={selectClassName(false)}
        >
          {DIFFICULTIES.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {DIFFICULTY_LABEL[difficulty]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="content" className="text-sm font-medium text-slate-700">
          Question content
        </label>
        <textarea
          id="content"
          rows={3}
          value={values.content}
          disabled={isSubmitting}
          placeholder="Enter the question stem"
          onChange={(event) => updateField('content', event.target.value)}
          className={textareaClassName(Boolean(errors.content))}
        />
        {errors.content ? <p className="text-sm text-red-500">{errors.content}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="explanation" className="text-sm font-medium text-slate-700">
          Explanation
        </label>
        <textarea
          id="explanation"
          rows={2}
          value={values.explanation}
          disabled={isSubmitting}
          placeholder="Optional explanation shown after answering"
          onChange={(event) => updateField('explanation', event.target.value)}
          className={textareaClassName(false)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-700">Answer options</p>
          <p className="text-xs text-slate-400">
            {values.type === 'SINGLE_CHOICE' ? 'Choose exactly one correct answer' : 'Choose at least one correct answer'}
          </p>
        </div>
        {errors.options ? <p className="text-sm text-red-500">{errors.options}</p> : null}

        <ul className="space-y-2">
          {values.options.map((option, index) => (
            <li key={index} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5">
              <label className="mt-2 flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-600">
                <input
                  type={values.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                  name="correct-option"
                  checked={option.isCorrect}
                  disabled={isSubmitting}
                  onChange={(event) => updateOption(index, { isCorrect: event.target.checked })}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-100"
                />
                Correct
              </label>
              <div className="min-w-0 flex-1 space-y-1">
                <Input
                  value={option.content}
                  hasError={Boolean(errors.optionContents?.[index])}
                  placeholder={`Option ${index + 1}`}
                  disabled={isSubmitting}
                  onChange={(event) => updateOption(index, { content: event.target.value })}
                />
                {errors.optionContents?.[index] ? (
                  <p className="text-sm text-red-500">{errors.optionContents[index]}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                className="mt-0.5 h-10 shrink-0 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={isSubmitting || values.options.length <= 1}
                onClick={() => removeOption(index)}
                aria-label="Remove option"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </li>
          ))}
        </ul>

        <Button type="button" variant="secondary" className="h-9" disabled={isSubmitting} onClick={addOption}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Add option
        </Button>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create question'
              : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
