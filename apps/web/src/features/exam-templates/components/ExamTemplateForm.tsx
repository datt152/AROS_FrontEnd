import { useMemo, useRef, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { getApiErrorMessage } from '../../../lib/apiError'
import { focusFirstFormError } from '../../../utils/focusFormError'
import { QUESTION_TYPE_LABEL } from '../../exams/types/exam.types'
import { usePreviewExamTemplate } from '../hooks/useExamTemplates'
import type {
  ExamTemplateFormErrors,
  ExamTemplateFormValues,
  ExamTemplateItem,
  ExamTemplatePreviewResult,
  ExamTemplateSelectionMode,
  ExamTemplateTopicSelection,
  TemplateQuestionOption,
  TemplateSubjectOption,
  TemplateTopicOption,
} from '../types/examTemplate.types'

type ExamTemplateFormProps = {
  mode: 'create' | 'edit'
  initialValues?: ExamTemplateItem
  subjectOptions: TemplateSubjectOption[]
  questionOptions: TemplateQuestionOption[]
  topicOptions?: TemplateTopicOption[]
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
    selectionMode: 'MANUAL',
    topicCounts: {},
  }
}

function buildTopicSelections(
  topicRows: Array<{ id: number; name: string; available: number }>,
  topicCounts: Record<number, number | ''>,
): { selections: ExamTemplateTopicSelection[]; error?: string } {
  const selections: ExamTemplateTopicSelection[] = []
  for (const topic of topicRows) {
    const raw = topicCounts[topic.id]
    const count = typeof raw === 'number' ? raw : 0
    if (!Number.isFinite(count) || count < 0) {
      return { selections: [], error: 'Số câu phải là số không âm' }
    }
    if (count > topic.available) {
      return {
        selections: [],
        error: `Topic “${topic.name}” chỉ còn ${topic.available} câu`,
      }
    }
    if (count > 0) selections.push({ topicId: topic.id, count })
  }
  if (selections.length === 0) {
    return { selections: [], error: 'Nhập số câu cho ít nhất một chủ đề' }
  }
  return { selections }
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
  const previewMutation = usePreviewExamTemplate()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [topicFilter, setTopicFilter] = useState<number | ''>('')
  const [values, setValues] = useState<ExamTemplateFormValues>(() => toFormValues(initialValues))
  const [errors, setErrors] = useState<ExamTemplateFormErrors>({})
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isComposing, setIsComposing] = useState(false)

  const isByTopic = values.selectionMode === 'BY_TOPIC'
  const canUseByTopic = mode === 'create'
  const busy = isSubmitting || previewMutation.isPending

  const availableQuestions = useMemo(() => {
    if (!values.subjectId) return []
    return questionOptions.filter((question) => {
      if (question.subjectId !== values.subjectId) return false
      if (topicFilter !== '' && question.topicId !== topicFilter) return false
      return true
    })
  }, [questionOptions, values.subjectId, topicFilter])

  const topicRows = useMemo(() => {
    if (!values.subjectId) return []
    return topicOptions.map((topic) => {
      const fromApi = topic.questionCount
      const fromLoaded = questionOptions.filter(
        (q) => q.subjectId === values.subjectId && q.topicId === topic.id,
      ).length
      return {
        ...topic,
        available: Math.max(fromApi, fromLoaded),
      }
    })
  }, [topicOptions, questionOptions, values.subjectId])

  const plannedTotal = useMemo(() => {
    return topicRows.reduce((sum, topic) => {
      const raw = values.topicCounts[topic.id]
      const n = typeof raw === 'number' ? raw : 0
      return sum + (Number.isFinite(n) ? n : 0)
    }, 0)
  }, [topicRows, values.topicCounts])

  function clearPreview() {
    setPreviewError(null)
  }

  function updateSubject(subjectId: number | '') {
    setValues((current) => ({
      ...current,
      subjectId,
      questionIds: [],
      topicCounts: {},
    }))
    setTopicFilter('')
    clearPreview()
    setErrors((current) => ({
      ...current,
      subjectId: undefined,
      questionIds: undefined,
      topicCounts: undefined,
    }))
    if (typeof subjectId === 'number' && subjectId > 0) onSubjectChange?.(subjectId)
  }

  function setSelectionMode(next: ExamTemplateSelectionMode) {
    if (!canUseByTopic && next === 'BY_TOPIC') return
    setValues((current) => ({
      ...current,
      selectionMode: next,
      questionIds: next === 'BY_TOPIC' ? [] : current.questionIds,
      topicCounts: next === 'MANUAL' ? {} : current.topicCounts,
    }))
    clearPreview()
    setErrors((current) => ({ ...current, questionIds: undefined, topicCounts: undefined }))
  }

  function updateTopicCount(topicId: number, available: number, raw: string) {
    const nextValue: number | '' = raw === '' ? '' : Number(raw)
    setValues((current) => ({
      ...current,
      topicCounts: { ...current.topicCounts, [topicId]: nextValue },
    }))
    clearPreview()
    setErrors((current) => ({ ...current, topicCounts: undefined, questionIds: undefined }))
    if (typeof nextValue === 'number' && nextValue > available) {
      setErrors((current) => ({
        ...current,
        topicCounts: `Không vượt quá số câu có sẵn (tối đa ${available})`,
      }))
    }
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

  function selectAllVisibleQuestions() {
    const visibleIds = availableQuestions.map((q) => q.questionId)
    if (visibleIds.length === 0) return
    setValues((current) => ({
      ...current,
      questionIds: Array.from(new Set([...current.questionIds, ...visibleIds])),
    }))
    setErrors((current) => ({ ...current, questionIds: undefined }))
  }

  function clearVisibleQuestions() {
    const visibleIds = new Set(availableQuestions.map((q) => q.questionId))
    setValues((current) => ({
      ...current,
      questionIds: current.questionIds.filter((id) => !visibleIds.has(id)),
    }))
    setErrors((current) => ({ ...current, questionIds: undefined }))
  }

  async function runPreview(): Promise<ExamTemplatePreviewResult | null> {
    const title = (titleInputRef.current?.value ?? values.title).trim()
    if (!title) {
      setErrors((current) => ({ ...current, title: 'Vui lòng nhập tiêu đề' }))
      focusFirstFormError({ title: 'Vui lòng nhập tiêu đề' }, ['title'])
      return null
    }
    if (title !== values.title.trim()) {
      setValues((current) => ({ ...current, title }))
    }
    if (!values.subjectId) {
      setErrors((current) => ({ ...current, subjectId: 'Vui lòng chọn môn học' }))
      return null
    }
    const built = buildTopicSelections(topicRows, values.topicCounts)
    if (built.error) {
      setErrors((current) => ({ ...current, topicCounts: built.error }))
      focusFirstFormError({ topicCounts: built.error }, ['topicCounts'])
      return null
    }

    setPreviewError(null)
    setErrors((current) => ({ ...current, title: undefined, topicCounts: undefined }))
    try {
      const result = await previewMutation.mutateAsync({
        title,
        subjectId: Number(values.subjectId),
        selectionMode: 'BY_TOPIC',
        topicSelections: built.selections,
      })
      setValues((current) => ({ ...current, title, questionIds: result.questionIds }))
      return result
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể random câu hỏi theo chủ đề')
      setPreviewError(message)
      return null
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const title = (titleInputRef.current?.value ?? values.title).trim()
    if (title && title !== values.title.trim()) {
      setValues((current) => ({ ...current, title }))
    }

    const nextErrors: ExamTemplateFormErrors = {}
    if (!title) nextErrors.title = 'Vui lòng nhập tiêu đề'
    if (!values.subjectId) nextErrors.subjectId = 'Vui lòng chọn môn học'

    let questionIds = values.questionIds

    if (isByTopic) {
      const built = buildTopicSelections(topicRows, values.topicCounts)
      if (built.error) nextErrors.topicCounts = built.error
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        focusFirstFormError(nextErrors, ['title', 'subjectId', 'topicCounts'])
        return
      }

      const previewed = await runPreview()
      if (!previewed) return
      questionIds = previewed.questionIds
    } else {
      if (questionIds.length < 1) nextErrors.questionIds = 'Chọn ít nhất 1 câu hỏi'
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        focusFirstFormError(nextErrors, ['title', 'subjectId', 'questionIds'])
        return
      }
    }

    await onSubmit({
      title,
      subjectId: Number(values.subjectId),
      questionIds,
      selectionMode: values.selectionMode,
      topicCounts: values.topicCounts,
    })
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        if (isComposing) {
          event.preventDefault()
          return
        }
        void handleSubmit(event)
      }}
      noValidate
    >
      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Tiêu đề
        </label>
        <Input
          id="title"
          ref={titleInputRef}
          value={values.title}
          hasError={Boolean(errors.title)}
          placeholder="Nhập tiêu đề đề mẫu"
          disabled={busy}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={(event) => {
            setIsComposing(false)
            const next = event.currentTarget.value
            setValues((current) => ({ ...current, title: next }))
            setErrors((current) => ({ ...current, title: undefined }))
          }}
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
          disabled={busy || mode === 'edit'}
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

      {canUseByTopic ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-800">Cách chọn câu hỏi</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setSelectionMode('MANUAL')}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                !isByTopic
                  ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium">Chọn thủ công</span>
              <span className="mt-0.5 block text-xs opacity-80">Chọn từng câu trong ngân hàng</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setSelectionMode('BY_TOPIC')}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                isByTopic
                  ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium">Chọn ngẫu nhiên</span>
              <span className="mt-0.5 block text-xs opacity-80">Nhập số câu mỗi chủ đề để chọn ngẫu nhiên</span>
            </button>
          </div>
        </div>
      ) : null}

      {isByTopic ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-800">Phân bố theo chủ đề</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {values.subjectId
                ? 'Nhập số câu mỗi chủ đề. Khi tạo, hệ thống sẽ random câu hỏi từ ngân hàng.'
                : 'Chọn môn trước để tải danh sách topic.'}
            </p>
          </div>

          {errors.topicCounts ? (
            <p className="text-sm text-red-500" data-form-field="topicCounts">
              {errors.topicCounts}
            </p>
          ) : null}

          {!values.subjectId ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Chọn môn để hiện các chủ đề.
            </p>
          ) : topicRows.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Môn này chưa có chủ đề.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[1fr_5.5rem_6.5rem] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span>Chủ đề</span>
                <span className="text-center">Số câu hỏi</span>
                <span className="text-center">Số câu chọn</span>
              </div>
              <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                {topicRows.map((topic) => {
                  const disabledRow = topic.available < 1
                  return (
                    <li
                      key={topic.id}
                      className={`grid grid-cols-[1fr_5.5rem_6.5rem] items-center gap-2 px-3 py-2.5 ${
                        disabledRow ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{topic.name}</p>
                      </div>
                      <p className="text-center text-sm tabular-nums text-slate-600">{topic.available}</p>
                      <Input
                        type="number"
                        min={0}
                        max={topic.available}
                        disabled={busy || disabledRow}
                        value={values.topicCounts[topic.id] ?? ''}
                        placeholder="0"
                        className="h-9 text-center"
                        onChange={(event) =>
                          updateTopicCount(topic.id, topic.available, event.target.value)
                        }
                      />
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                <span className="text-slate-500">{topicRows.length} chủ đề</span>
                <span className="font-medium text-slate-800">
                  Tổng lấy: <span className="tabular-nums text-blue-700">{plannedTotal}</span> câu
                </span>
              </div>
            </div>
          )}

          {previewError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {previewError}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-slate-800">Chọn câu hỏi</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {values.subjectId ? 'Chọn câu hỏi thuộc môn đã chọn.' : 'Chọn môn trước để tải câu hỏi.'}
              </p>
            </div>
            {values.subjectId && availableQuestions.length > 0 ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  className="h-8 px-3 text-xs"
                  onClick={selectAllVisibleQuestions}
                >
                  Chọn tất cả
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy || values.questionIds.length === 0}
                  className="h-8 px-3 text-xs"
                  onClick={clearVisibleQuestions}
                >
                  Bỏ chọn tất cả
                </Button>
              </div>
            ) : null}
          </div>

          {values.subjectId ? (
            <select
              value={topicFilter}
              disabled={busy}
              onChange={(event) =>
                setTopicFilter(event.target.value === '' ? '' : Number(event.target.value))
              }
              className={selectClassName(false)}
            >
              <option value="">Tất cả chủ đề</option>
              {topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name} ({topic.questionCount})
                </option>
              ))}
            </select>
          ) : null}

          {errors.questionIds ? (
            <p className="text-sm text-red-500" data-form-field="questionIds">
              {errors.questionIds}
            </p>
          ) : null}

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
                      disabled={busy}
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
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Hủy
        </Button>
        <Button type="submit" disabled={busy}>
          {isSubmitting || previewMutation.isPending
            ? mode === 'create'
              ? previewMutation.isPending
                ? 'Đang random câu hỏi...'
                : 'Đang tạo...'
              : 'Đang lưu...'
            : mode === 'create'
              ? 'Tạo đề mẫu'
              : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  )
}
